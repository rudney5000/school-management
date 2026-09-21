import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { parents, students, teacherSchools, users, workers } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { env } from '@/config/env';
import type { LoginDto, RegisterDto } from './auth.schema';
import type { UserRole } from '@/shared/types/express';
import { createIdentifiers } from './user-identifiers.service';

export interface TokenPayload {
  id: string;
  email?: string;
  role: UserRole;
  schoolId: string;
  subSchoolId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreatedUser {
  id: string;
  email?: string;
  role: UserRole;
}

export class AuthService {
  async register(input: RegisterDto, actor: Express.User): Promise<CreatedUser> {
    await this.assertProfileInActorScope(input, actor);

    const [user] = await db
      .insert(users)
      .values({
        password: await bcrypt.hash(input.password, 10),
        role: input.role,
        workerId: input.workerId,
        teacherId: input.teacherId,
        studentId: input.studentId,
        parentId: input.parentId,
      })
      .returning();

    try {
      await createIdentifiers(user.id, {
        email: input.email,
        phone: input.phone,
        username: input.username,
      });
    } catch (error) {
      await db.delete(users).where(eq(users.id, user.id));
      throw error;
    }

    return { id: user.id, email: input.email, role: user.role as UserRole };
  }

  private async assertProfileInActorScope(input: RegisterDto, actor: Express.User): Promise<void> {
    if (actor.role === 'super_admin') {
      return;
    }

    const { subSchoolId } = actor;

    if (!subSchoolId) {
      throw new AppError('FORBIDDEN', 'Aucune sous-école associée à ce compte', 403);
    }

    const scoped = async (found: unknown): Promise<void> => {
      if (!found) {
        throw new AppError('FORBIDDEN', 'Profil hors de votre sous-école', 403);
      }
    };

    if (input.workerId) {
      const [row] = await db
        .select({ id: workers.id })
        .from(workers)
        .where(and(eq(workers.id, input.workerId), eq(workers.subSchoolId, subSchoolId)))
        .limit(1);
      await scoped(row);
    }

    if (input.teacherId) {
      const [row] = await db
        .select({ id: teacherSchools.id })
        .from(teacherSchools)
        .where(
          and(
            eq(teacherSchools.teacherId, input.teacherId),
            eq(teacherSchools.subSchoolId, subSchoolId),
          ),
        )
        .limit(1);
      await scoped(row);
    }

    if (input.studentId) {
      const [row] = await db
        .select({ id: students.id })
        .from(students)
        .where(and(eq(students.id, input.studentId), eq(students.subSchoolId, subSchoolId)))
        .limit(1);
      await scoped(row);
    }

    if (input.parentId) {
      const [row] = await db
        .select({ id: parents.id })
        .from(parents)
        .where(and(eq(parents.id, input.parentId), eq(parents.subSchoolId, subSchoolId)))
        .limit(1);
      await scoped(row);
    }
  }

  async login(input: LoginDto): Promise<AuthTokens> {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
    }

    const context = await this.resolveContext(user);

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    return this.generateTokens({
      id: user.id,
      email: user.email ?? undefined,
      role: user.role as UserRole,
      schoolId: context.schoolId,
      subSchoolId: context.subSchoolId,
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;

    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401);
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.id)).limit(1);

    if (!user) {
      throw new AppError('UNAUTHORIZED', 'User not found', 401);
    }

    return this.generateTokens(payload);
  }

  async me(userId: string): Promise<TokenPayload> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new AppError('NOT_FOUND', 'User not found', 404);
    }

    const context = await this.resolveContext(user);

    return {
      id: user.id,
      email: user.email ?? undefined,
      role: user.role as UserRole,
      schoolId: context.schoolId,
      subSchoolId: context.subSchoolId,
    };
  }

  async resolveContext(user: typeof users.$inferSelect): Promise<{
    schoolId: string;
    subSchoolId?: string;
  }> {
    const { workers, teachers, teacherSchools, students, parents, subSchools } =
      await import('@/db/schema');

    switch (user.role) {
      case 'admin':
      case 'director':
      case 'worker': {
        if (!user.workerId) return { schoolId: '' };

        const [worker] = await db
          .select({ subSchoolId: workers.subSchoolId })
          .from(workers)
          .where(eq(workers.id, user.workerId))
          .limit(1);

        if (!worker) return { schoolId: '' };

        const [sub] = await db
          .select({ schoolId: subSchools.schoolId })
          .from(subSchools)
          .where(eq(subSchools.id, worker.subSchoolId))
          .limit(1);

        return { schoolId: sub.schoolId, subSchoolId: worker.subSchoolId };
      }

      case 'teacher': {
        if (!user.teacherId) return { schoolId: '' };

        const [ts] = await db
          .select({ subSchoolId: teacherSchools.subSchoolId })
          .from(teacherSchools)
          .where(eq(teacherSchools.teacherId, user.teacherId))
          .limit(1);

        if (!ts) return { schoolId: '' };

        const [sub] = await db
          .select({ schoolId: subSchools.schoolId })
          .from(subSchools)
          .where(eq(subSchools.id, ts.subSchoolId))
          .limit(1);

        return { schoolId: sub.schoolId, subSchoolId: ts.subSchoolId };
      }

      case 'student': {
        if (!user.studentId) return { schoolId: '' };

        const [student] = await db
          .select({ subSchoolId: students.subSchoolId })
          .from(students)
          .where(eq(students.id, user.studentId))
          .limit(1);

        if (!student) return { schoolId: '' };

        const [sub] = await db
          .select({ schoolId: subSchools.schoolId })
          .from(subSchools)
          .where(eq(subSchools.id, student.subSchoolId))
          .limit(1);

        return { schoolId: sub.schoolId, subSchoolId: student.subSchoolId };
      }

      case 'parent': {
        if (!user.parentId) return { schoolId: '' };

        const [parent] = await db
          .select({ subSchoolId: parents.subSchoolId })
          .from(parents)
          .where(eq(parents.id, user.parentId))
          .limit(1);

        if (!parent) return { schoolId: '' };

        const [sub] = await db
          .select({ schoolId: subSchools.schoolId })
          .from(subSchools)
          .where(eq(subSchools.id, parent.subSchoolId))
          .limit(1);

        return { schoolId: sub.schoolId, subSchoolId: parent.subSchoolId };
      }

      default:
        return { schoolId: '' };
    }
  }

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessOptions: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    };

    const refreshOptions: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);

    const refreshToken = jwt.sign({ id: payload.id }, env.JWT_REFRESH_SECRET, refreshOptions);

    return { accessToken, refreshToken };
  }
}
