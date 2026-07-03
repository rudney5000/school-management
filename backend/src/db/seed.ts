import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {db} from './index';
import {
    schools,
    subSchools,
    districts,
    cities,
    departments,
    countries,
    workers,
    students,
    users,
    teacherSchools,
    teachers,
    parents,
    classes,
    parentStudents,
    courses,
    schedules,
    events,
    studentAttendances,
    teacherAttendances,
    grades,
    academicPeriods,
    conversations,
    messages,
    conversationMembers,
    messageStars,
    messageArchives,
    messageAttachments,
} from './schema';
import {
    and,
    eq
} from 'drizzle-orm';
import {
    examResults,
    exams
} from "@/db/schema/exam";

async function seed() {
    console.log('Seeding...');

    const insertedCountries = await db.insert(countries)
        .values([
            {name: 'République Démocratique du Congo', code: 'COD'},
            {name: 'Congo', code: 'COG'},
            {name: 'Angola', code: 'AGO'},
            {name: 'Zambie', code: 'ZMB'},
            {name: 'Tanzanie', code: 'TZA'},
            {name: 'Burundi', code: 'BDI'},
            {name: 'Rwanda', code: 'RWA'},
            {name: 'Ouganda', code: 'UGA'},
            {name: 'Soudan du Sud', code: 'SSD'},
            {name: 'Centrafrique', code: 'CAF'},
        ])
        .onConflictDoNothing()
        .returning();

    const allCountries = insertedCountries.length
        ? insertedCountries
        : await db.select().from(countries);

    console.log(`✓ ${allCountries.length} Countries`);

    const rdc = allCountries.find(c => c.code === 'COD')!;
    const congo = allCountries.find(c => c.code === 'COG')!;

    const insertedDepartments = await db.insert(departments)
        .values([
            {name: 'Kinshasa', code: 'KIN', countryId: rdc.id},
            {name: 'Bas-Uele', code: 'BU', countryId: rdc.id},
            {name: 'Équateur', code: 'EQ', countryId: rdc.id},
            {name: 'Haut-Katanga', code: 'HK', countryId: rdc.id},
            {name: 'Haut-Lomami', code: 'HL', countryId: rdc.id},
            {name: 'Brazzaville', code: 'BZV', countryId: congo.id},
            {name: 'Pointe-Noire', code: 'PNR', countryId: congo.id},
            {name: 'Niari', code: 'NIA', countryId: congo.id},
            {name: 'Bouenza', code: 'BOU', countryId: congo.id},
            {name: 'Lékoumou', code: 'LEK', countryId: congo.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allDepartments = insertedDepartments.length
        ? insertedDepartments
        : await db.select().from(departments);

    console.log(`✓ ${allDepartments.length} Departments`);

    const kinshasa = allDepartments.find(d => d.code === 'KIN')!;
    const buUele = allDepartments.find(d => d.code === 'BU')!;
    const equateur = allDepartments.find(d => d.code === 'EQ')!;
    const hautKat = allDepartments.find(d => d.code === 'HK')!;
    const hautLom = allDepartments.find(d => d.code === 'HL')!;
    const brazza = allDepartments.find(d => d.code === 'BZV')!;
    const pNoire = allDepartments.find(d => d.code === 'PNR')!;
    const niari = allDepartments.find(d => d.code === 'NIA')!;
    const bouenza = allDepartments.find(d => d.code === 'BOU')!;
    const lekoumou = allDepartments.find(d => d.code === 'LEK')!;

    const insertedCities = await db.insert(cities)
        .values([
            {name: 'Kinshasa', departmentId: kinshasa.id},
            {name: 'Kisangani', departmentId: buUele.id},
            {name: 'Mbandaka', departmentId: equateur.id},
            {name: 'Lubumbashi', departmentId: hautKat.id},
            {name: 'Kamina', departmentId: hautLom.id},
            {name: 'Brazzaville', departmentId: brazza.id},
            {name: 'Pointe-Noire', departmentId: pNoire.id},
            {name: 'Dolisie', departmentId: niari.id},
            {name: 'Mouyondzi', departmentId: bouenza.id},
            {name: 'Sibiti', departmentId: lekoumou.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allCities = insertedCities.length
        ? insertedCities
        : await db.select().from(cities);

    console.log(`✓ ${allCities.length} Cities`);

    const kinshasaCity = allCities.find(c => c.name === 'Kinshasa')!;

    const insertedDistricts = await db.insert(districts)
        .values([
            {name: 'Gombe', cityId: kinshasaCity.id},
            {name: 'Lingwala',cityId: kinshasaCity.id},
            {name: 'Barumbu', cityId: kinshasaCity.id},
            {name: 'Kinshasa', cityId: kinshasaCity.id},
            {name: 'Kasa-Vubu', cityId: kinshasaCity.id},
            {name: 'Lemba', cityId: kinshasaCity.id},
            {name: 'Matete', cityId: kinshasaCity.id},
            {name: 'Ngaliema', cityId: kinshasaCity.id},
            {name: 'Ndjili', cityId: kinshasaCity.id},
            {name: 'Kalamu', cityId: kinshasaCity.id},
        ])
        .onConflictDoNothing()
        .returning();

    const allDistricts = insertedDistricts.length
        ? insertedDistricts
        : await db.select().from(districts);

    console.log(`✓ ${allDistricts.length} Districts`);

    const gombeDistrict = allDistricts.find(d => d.name === 'Gombe')!;

    const [existingSchool] = await db.select().from(schools)
        .where(eq(schools.code, 'GSJ-001'));

    const school = existingSchool ?? (await db.insert(schools).values({
        name: 'Groupe Scolaire Saint-Joseph',
        code: 'GSJ-001',
        email: 'contact@saintjoseph.cd',
        districtId: gombeDistrict.id,
    }).returning())[0];

    console.log('✓ School:', school.name);

    const [existingSubSchool] = await db.select().from(subSchools)
        .where(eq(subSchools.code, 'GSJ-GOMBE'));

    const subSchool = existingSubSchool ?? (await db.insert(subSchools).values({
        name: 'Saint-Joseph Gombe',
        code: 'GSJ-GOMBE',
        schoolId: school.id,
    }).returning())[0];

    console.log('✓ SubSchool:', subSchool.name);

    const hashedPassword = await bcrypt.hash('password123', 10);

    await db.delete(users).where(eq(users.email, 'jean.muamba@saintjoseph.cd')).catch(() => {});
    await db.delete(teacherSchools).where(
        eq(teacherSchools.teacherId,
            db.select({ id: teachers.id })
                .from(teachers)
                .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'))
                .limit(1)
        )
    ).catch(() => {});
    await db.delete(teachers).where(eq(teachers.email, 'jean.muamba@saintjoseph.cd')).catch(() => {});

    let teacher;
    const [existingTeacher] = await db.select().from(teachers)
        .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'));

    if (!existingTeacher) {
        const [newTeacher] = await db.insert(teachers).values({
            firstName: 'Jean',
            lastName: 'Muamba',
            email: 'jean.muamba@saintjoseph.cd',
            gender: 'male',
            dateOfBirth: '1985-03-15',
            phone: '+243 81 234 5678',
            address: 'Kinshasa, DRC',
            enrollmentDate: '2024-09-01',
        }).returning();

        await db.insert(teacherSchools).values({
            teacherId: newTeacher.id,
            subSchoolId: subSchool.id,
            hireDate: '2020-09-01',
            qualification: 'Licence en Mathématiques',
            specialization: 'Mathématiques',
            isActive: true,
        });

        await db.insert(users).values({
            email: 'jean.muamba@saintjoseph.cd',
            password: hashedPassword,
            role: 'teacher',
            teacherId: newTeacher.id,
        });

        teacher = newTeacher;
        console.log('✓ Teacher user: jean.muamba@saintjoseph.cd');
    } else {
        teacher = existingTeacher;
        console.log('~ Teacher already exists');
    }

    const sampleCourses = [
        {
            name: 'Mathématiques',
            code: 'MATH-01',
            description: 'Algèbre, géométrie et analyse',
            credits: 4,
            icon: 'ruler' as const,
            color: 'blue' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            teacherId: teacher.id,
            subSchoolId: subSchool.id
        },
        {
            name: 'Français',
            code: 'FR-01',
            description: 'Grammaire, littérature et expression écrite',
            credits: 4,
            icon: 'pencil' as const,
            color: 'violet' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Physique-Chimie',
            code: 'PC-01',
            description: 'Mécanique, thermodynamique et chimie générale',
            credits: 3,
            icon: 'zap' as const,
            color: 'orange' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Biologie',
            code: 'BIO-01',
            description: 'Sciences de la vie et de la terre',
            credits: 3,
            icon: 'book-open' as const,
            color: 'green' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Histoire-Géographie',
            code: 'HG-01',
            description: 'Histoire du Congo et géographie mondiale',
            credits: 2,
            icon: 'graduation-cap' as const,
            color: 'amber' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Anglais',
            code: 'EN-01',
            description: 'Langue anglaise niveau secondaire',
            credits: 2,
            icon: 'lightbulb' as const,
            color: 'teal' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Éducation Civique',
            code: 'EC-01',
            description: 'Citoyenneté et institutions',
            credits: 1,
            icon: 'book-open' as const,
            color: 'pink' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
        {
            name: 'Informatique',
            code: 'INFO-01',
            description: 'Bureautique et initiation à la programmation',
            credits: 2,
            icon: 'smartphone' as const,
            color: 'purple' as const,
            status: 'active' as const,
            totalLessons: 0,
            totalHours: 0,
            subSchoolId: subSchool.id
        },
    ];

    for (const course of sampleCourses) {
        const [existing] = await db.select().from(courses)
            .where(and(eq(courses.code, course.code), eq(courses.subSchoolId, course.subSchoolId)));

        if (!existing) {
            await db.insert(courses).values(course);
            console.log(`✓ Course created: ${course.name}`);
        } else {
            console.log(`~ Course already exists: ${course.name}`);
        }
    }

    const sampleClasses = [
        { name: '1ère Année Secondaire A', gradeLevel: 'Secondaire 1', capacity: 35, subSchoolId: subSchool.id },
        { name: '1ère Année Secondaire B', gradeLevel: 'Secondaire 1', capacity: 35, subSchoolId: subSchool.id },
        { name: '2ème Année Secondaire A', gradeLevel: 'Secondaire 2', capacity: 30, subSchoolId: subSchool.id },
        { name: '3ème Année Secondaire A', gradeLevel: 'Secondaire 3', capacity: 30, subSchoolId: subSchool.id },
    ];

    for (const cls of sampleClasses) {
        const [existingClass] = await db.select().from(classes).where(
            and(eq(classes.name, cls.name), eq(classes.subSchoolId, cls.subSchoolId))
        );

        if (!existingClass) {
            await db.insert(classes).values(cls);
            console.log(`✓ Class created: ${cls.name}`);
        }
    }

    const [existingAdmin] = await db.select().from(users)
        .where(eq(users.email, 'admin@saintjoseph.cd'));

    if (!existingAdmin) {
        const [worker] = await db.insert(workers).values({
            firstName: 'Admin',
            lastName: 'School',
            email: 'admin@saintjoseph.cd',
            subSchoolId: subSchool.id,
        }).returning();

        await db.insert(users).values({
            email: 'admin@saintjoseph.cd',
            password: hashedPassword,
            role: 'admin',
            workerId: worker.id,
        });

        console.log('✓ Admin user: admin@saintjoseph.cd');
    } else {
        console.log('~ Admin user already exists');
    }

    const [existingDirector] = await db.select().from(users)
        .where(eq(users.email, 'directeur@saintjoseph.cd'))

    if (!existingDirector) {
        const [directorWorker] = await db.insert(workers).values({
            firstName: 'Emmanuel',
            lastName: 'Tshisekedi',
            email: 'directeur@saintjoseph.cd',
            subSchoolId: subSchool.id,
        }).returning()

        await db.insert(users).values({
            email: 'directeur@saintjoseph.cd',
            password: hashedPassword,
            role: 'director',
            workerId: directorWorker.id,
        })
        console.log('✓ Director user: directeur@saintjoseph.cd')
    } else {
        console.log('~ Director already exists')
    }

    const [existingWorker] = await db.select().from(users)
        .where(eq(users.email, 'secretaire@saintjoseph.cd'))

    if (!existingWorker) {
        const [staffWorker] = await db.insert(workers).values({
            firstName: 'Cécile',
            lastName: 'Mbuyi',
            email: 'secretaire@saintjoseph.cd',
            subSchoolId: subSchool.id,
        }).returning()

        await db.insert(users).values({
            email: 'secretaire@saintjoseph.cd',
            password: hashedPassword,
            role: 'worker',
            workerId: staffWorker.id,
        })
        console.log('✓ Worker user: secretaire@saintjoseph.cd')
    } else {
        console.log('~ Worker already exists')
    }

    try {
        await db.delete(users).where(eq(users.email, 'marie.kabila@saintjoseph.cd'))
        console.log('✓ Deleted user')
        await db.delete(students).where(eq(students.email, 'marie.kabila@saintjoseph.cd'))
        console.log('✓ Deleted student')
    } catch(err) {
        console.error('Delete error:', err)
    }
    const [student] = await db.insert(students).values({
        firstName: 'Marie',
        lastName: 'Kabila',
        email: 'marie.kabila@saintjoseph.cd',
        gender: 'female',
        dateOfBirth: '2008-07-20',
        enrollmentDate: '2024-09-01',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'marie.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'student',
        studentId: student.id,
    });

    console.log('✓ Student user: marie.kabila@saintjoseph.cd')

    await db.delete(users).where(eq(users.email, 'paul.kabila@saintjoseph.cd')).catch(() => {});
    await db.delete(students).where(eq(students.email, 'paul.kabila@saintjoseph.cd')).catch(() => {});

    const [student2] = await db.insert(students).values({
        firstName: 'Paul',
        lastName: 'Kabila',
        email: 'paul.kabila@saintjoseph.cd',
        gender: 'male',
        dateOfBirth: '2010-03-15',
        enrollmentDate: '2024-09-01',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'paul.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'student',
        studentId: student2.id,
    });

    console.log('✓ Student 2: paul.kabila@saintjoseph.cd');

    await db.delete(users).where(eq(users.email, 'sophie.kabila@saintjoseph.cd')).catch(() => {});
    await db.delete(parents).where(eq(parents.email, 'sophie.kabila@saintjoseph.cd')).catch(() => {});

    const [parent] = await db.insert(parents).values({
        firstName: 'Sophie',
        lastName: 'Kabila',
        email: 'sophie.kabila@saintjoseph.cd',
        phone: '+243 81 111 2222',
        gender: 'female',
        address: 'Kinshasa, RDC',
        subSchoolId: subSchool.id,
    }).returning();

    await db.insert(users).values({
        email: 'sophie.kabila@saintjoseph.cd',
        password: hashedPassword,
        role: 'parent',
        parentId: parent.id,
    });
    console.log('✓ Parent user: sophie.kabila@saintjoseph.cd');

    await db.insert(parentStudents)
        .values([
            { parentId: parent.id, studentId: student.id },
            { parentId: parent.id, studentId: student2.id },
        ])
        .onConflictDoNothing();
    console.log('✓ Parent-students links created');


    const [existingSchedule] = await db.select().from(schedules)
        .where(and(
            eq(schedules.subSchoolId, subSchool.id),
            eq(schedules.dayOfWeek, 'MONDAY'),
            eq(schedules.startTime, '08:00')
        ));

    if (!existingSchedule) {
        const [mathCourse] = await db.select().from(courses)
            .where(and(eq(courses.code, 'MATH-01'), eq(courses.subSchoolId, subSchool.id)));

        const [classA] = await db.select().from(classes)
            .where(and(eq(classes.name, '1ère Année Secondaire A'), eq(classes.subSchoolId, subSchool.id)));

        const [teacher] = await db.select().from(teachers)
            .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'));

        await db.insert(schedules).values({
            subSchoolId: subSchool.id,
            classId: classA.id,
            courseId: mathCourse.id,
            teacherId: teacher.id,
            dayOfWeek: 'MONDAY',
            startTime: '08:00',
            endTime: '09:00',
            room: 'Salle 12',
            academicYear: '2024-2025',
        });

        console.log('✓ Schedule created: Math, Monday 08:00-09:00');
    } else {
        console.log('~ Schedule already exists');
    }
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, 'admin@saintjoseph.cd')
    });

    if (adminUser) {
        const sampleEvents = [
            {
                title: 'Cérémonie de Rentrée Scolaire 2024-2025',
                description: 'Accueil des élèves, discours de la direction et présentation du corps professoral.',
                type: 'MEETING',
                startDate: new Date('2024-09-02T08:00:00Z'),
                endDate: new Date('2024-09-02T12:00:00Z'),
                location: 'Cour principale',
                isPublic: true,
                subSchoolId: subSchool.id,
                createdBy: adminUser.id,
            },
            {
                title: 'Examens du Premier Trimestre',
                description: 'Période d\'évaluations pour toutes les classes du secondaire. Présence obligatoire.',
                type: 'EXAM',
                startDate: new Date('2024-11-18T07:30:00Z'),
                endDate: new Date('2024-11-29T16:00:00Z'),
                location: 'Salles de classe habituelles',
                isPublic: false,
                subSchoolId: subSchool.id,
                createdBy: adminUser.id,
            },
            {
                title: 'Tournoi Inter-Classes de Football',
                description: 'Compétition sportive amicale entre les classes de 1ère et 2ème année secondaire.',
                type: 'SPORT' as any,
                startDate: new Date('2024-10-15T14:00:00Z'),
                endDate: new Date('2024-10-15T17:00:00Z'),
                location: 'Terrain de sport de l\'école',
                isPublic: true,
                subSchoolId: subSchool.id,
                createdBy: adminUser.id,
            }
        ];

        for (const event of sampleEvents) {
            const [existingEvent] = await db.select().from(events)
                .where(and(
                    eq(events.title, event.title),
                    eq(events.subSchoolId, event.subSchoolId)
                ));

            if (!existingEvent) {
                await db.insert(events).values(event);
                console.log(`✓ Event created: ${event.title}`);
            } else {
                console.log(`~ Event already exists: ${event.title}`);
            }
        }
    } else {
        console.log('⚠ Admin user not found, skipping events creation.');
    }

    const STATUS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
    type AttStatus = typeof STATUS[number];

    function randomStatus(weights = [75, 10, 10, 5]): AttStatus {
        const total = weights.reduce((a, b) => a + b, 0);
        const rand  = Math.random() * total;
        let cumul   = 0;
        for (let i = 0; i < weights.length; i++) {
            cumul += weights[i];
            if (rand < cumul) return STATUS[i];
        }
        return 'PRESENT';
    }

    function getLast14SchoolDays(): string[] {
        const days: string[] = [];
        const cursor = new Date();
        while (days.length < 14) {
            const dow = cursor.getDay();
            if (dow !== 0 && dow !== 6) {
                days.push(cursor.toISOString().slice(0, 10));
            }
            cursor.setDate(cursor.getDate() - 1);
        }
        return days.reverse();
    }

    const schoolDays = getLast14SchoolDays();

    const allStudentsForAtt = [student, student2];

    const studentAttRows = allStudentsForAtt.flatMap((s) =>
        schoolDays.map((date) => ({
            subSchoolId: subSchool.id,
            studentId:   s.id,
            date,
            status:      randomStatus([75, 10, 10, 5]),
            reason:      null as string | null,
            note:        null as string | null,
        })),
    );

    await db
        .insert(studentAttendances)
        .values(studentAttRows)
        .onConflictDoNothing();

    console.log(`✓ ${studentAttRows.length} student attendances insérées`);

    const teacherAttRows = schoolDays.map((date) => ({
        subSchoolId: subSchool.id,
        teacherId:   teacher.id,
        date,
        status:      randomStatus([85, 5, 7, 3]),
        reason:      null as string | null,
    }));

    await db
        .insert(teacherAttendances)
        .values(teacherAttRows)
        .onConflictDoNothing();

    console.log(`✓ ${teacherAttRows.length} teacher attendances insérées`);

    const [mathCourseForExam] = await db.select().from(courses)
        .where(and(eq(courses.code, 'MATH-01'), eq(courses.subSchoolId, subSchool.id)))

    const [frCourse] = await db.select().from(courses)
        .where(and(eq(courses.code, 'FR-01'), eq(courses.subSchoolId, subSchool.id)))

    const [pcCourse] = await db.select().from(courses)
        .where(and(eq(courses.code, 'PC-01'), eq(courses.subSchoolId, subSchool.id)))

    const [classA] = await db.select().from(classes)
        .where(and(eq(classes.name, '1ère Année Secondaire A'), eq(classes.subSchoolId, subSchool.id)))

    const [classB] = await db.select().from(classes)
        .where(and(eq(classes.name, '1ère Année Secondaire B'), eq(classes.subSchoolId, subSchool.id)))

    const [teacherForExam] = await db.select().from(teachers)
        .where(eq(teachers.email, 'jean.muamba@saintjoseph.cd'))

    const [teacherUser] = await db.select().from(users)
        .where(eq(users.email, 'jean.muamba@saintjoseph.cd'))

    const sampleExams = [
        {
            title: 'Interrogation — Algèbre linéaire',
            type: 'quiz' as const,
            status: 'completed' as const,
            courseId: mathCourseForExam.id,
            classId: classA.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-10-10T08:00:00Z'),
            durationMinutes: 30,
            maxScore: '10',
            coefficient: '1',
            createdBy: teacherUser.id,
        },
        {
            title: 'Examen mi-trimestre — Mathématiques',
            type: 'midterm' as const,
            status: 'completed' as const,
            courseId: mathCourseForExam.id,
            classId: classA.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-10-28T08:00:00Z'),
            durationMinutes: 120,
            maxScore: '20',
            coefficient: '2',
            createdBy: teacherUser.id,
        },
        {
            title: 'Examen final — Mathématiques',
            type: 'final' as const,
            status: 'scheduled' as const,
            courseId: mathCourseForExam.id,
            classId: classA.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-11-20T08:00:00Z'),
            durationMinutes: 180,
            maxScore: '20',
            coefficient: '3',
            createdBy: teacherUser.id,
        },
        {
            title: 'Interrogation — Expression écrite',
            type: 'quiz' as const,
            status: 'completed' as const,
            courseId: frCourse.id,
            classId: classA.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-10-08T10:00:00Z'),
            durationMinutes: 45,
            maxScore: '10',
            coefficient: '1',
            createdBy: teacherUser.id,
        },
        {
            title: 'Devoir maison — Littérature',
            type: 'homework' as const,
            status: 'completed' as const,
            courseId: frCourse.id,
            classId: classB.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-10-15T00:00:00Z'),
            durationMinutes: 60,
            maxScore: '20',
            coefficient: '1',
            createdBy: teacherUser.id,
        },
        {
            title: 'Interrogation orale — Physique',
            type: 'oral' as const,
            status: 'ongoing' as const,
            courseId: pcCourse.id,
            classId: classA.id,
            subSchoolId: subSchool.id,
            examDate: new Date('2024-11-05T09:00:00Z'),
            durationMinutes: 20,
            maxScore: '10',
            coefficient: '1',
            createdBy: teacherUser.id,
        },
    ]

    const insertedExams: (typeof exams.$inferSelect)[] = []

    for (const exam of sampleExams) {
        const [existing] = await db.select().from(exams)
            .where(and(
                eq(exams.title, exam.title),
                eq(exams.subSchoolId, exam.subSchoolId),
            ))

        if (!existing) {
            const [inserted] = await db.insert(exams).values(exam).returning()
            insertedExams.push(inserted)
            console.log(`✓ Exam created: ${exam.title}`)
        } else {
            insertedExams.push(existing)
            console.log(`~ Exam already exists: ${exam.title}`)
        }
    }

    const completedExams = insertedExams.filter(e => e.status === 'completed')
    const allStudentsForResults = [student, student2]

    function randomScore(max: number): string {
        const percent = 0.4 + Math.random() * 0.6
        return (Math.round(percent * max * 10) / 10).toFixed(1)
    }

    for (const exam of completedExams) {
        for (const s of allStudentsForResults) {
            const [existing] = await db.select().from(examResults)
                .where(and(
                    eq(examResults.examId, exam.id),
                    eq(examResults.studentId, s.id),
                ))

            if (!existing) {
                await db.insert(examResults).values({
                    examId: exam.id,
                    studentId: s.id,
                    score: randomScore(Number(exam.maxScore)),
                    comment: null,
                    gradedBy: teacherUser.id,
                    gradedAt: new Date(),
                })
                console.log(`✓ Result: ${s.firstName} ${s.lastName} → ${exam.title}`)
            } else {
                console.log(`~ Result already exists: ${s.firstName} ${s.lastName} → ${exam.title}`)
            }
        }
    }

    const samplePeriods = [
        {
            subSchoolId: subSchool.id,
            name: 'Trimestre 1',
            type: 'trimester' as const,
            startDate: new Date('2024-09-02'),
            endDate: new Date('2024-11-30'),
            isCurrent: false,
        },
        {
            subSchoolId: subSchool.id,
            name: 'Trimestre 2',
            type: 'trimester' as const,
            startDate: new Date('2024-12-01'),
            endDate: new Date('2025-02-28'),
            isCurrent: true,
        },
        {
            subSchoolId: subSchool.id,
            name: 'Trimestre 3',
            type: 'trimester' as const,
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-06-30'),
            isCurrent: false,
        },
    ]

    const insertedPeriods: (typeof academicPeriods.$inferSelect)[] = []

    for (const period of samplePeriods) {
        const [existing] = await db.select().from(academicPeriods)
            .where(and(
                eq(academicPeriods.name, period.name),
                eq(academicPeriods.subSchoolId, period.subSchoolId),
            ))

        if (!existing) {
            const [inserted] = await db.insert(academicPeriods).values(period).returning()
            insertedPeriods.push(inserted)
            console.log(`✓ Academic period created: ${period.name}`)
        } else {
            insertedPeriods.push(existing)
            console.log(`~ Academic period already exists: ${period.name}`)
        }
    }

    const trimestre1 = insertedPeriods.find(p => p.name === 'Trimestre 1')!

    const [frCourseForGrade] = await db.select().from(courses)
        .where(and(eq(courses.code, 'FR-01'), eq(courses.subSchoolId, subSchool.id)))

    const [classAForGrade] = await db.select().from(classes)
        .where(and(eq(classes.name, '1ère Année Secondaire A'), eq(classes.subSchoolId, subSchool.id)))

    const allStudentsForGrades = [student, student2]

    const gradeTypes = ['homework', 'participation', 'project', 'oral'] as const

    const sampleGrades = allStudentsForGrades.flatMap(s =>
        gradeTypes.flatMap(gradeType => [
            {
                subSchoolId: subSchool.id,
                studentId:        s.id,
                courseId:         mathCourseForExam.id,
                classId:          classAForGrade.id,
                academicPeriodId: trimestre1.id,
                gradeType,
                score:            String((Math.round((8 + Math.random() * 12) * 10) / 10).toFixed(1)),
                maxScore:         '20',
                coefficient:      '1',
                comment:          null,
                gradedBy:         teacherUser.id,
                gradedAt:         new Date(),
            },
            {
                subSchoolId: subSchool.id,
                studentId:        s.id,
                courseId:         frCourseForGrade.id,
                classId:          classAForGrade.id,
                academicPeriodId: trimestre1.id,
                gradeType,
                score:            String((Math.round((8 + Math.random() * 12) * 10) / 10).toFixed(1)),
                maxScore:         '20',
                coefficient:      '1',
                comment:          null,
                gradedBy:         teacherUser.id,
                gradedAt:         new Date(),
            },
        ])
    )

    for (const g of sampleGrades) {
        const [existing] = await db.select().from(grades)
            .where(and(
                eq(grades.studentId, g.studentId),
                eq(grades.courseId, g.courseId),
                eq(grades.academicPeriodId, g.academicPeriodId),
                eq(grades.gradeType, g.gradeType),
            ))

        if (!existing) {
            await db.insert(grades).values(g)
            console.log(`✓ Grade created: ${g.gradeType} → student ${g.studentId}`)
        } else {
            console.log(`~ Grade already exists: ${g.gradeType} → student ${g.studentId}`)
        }
    }

    const teacherUserForChat = await db.query.users.findFirst({
        where: eq(users.email, 'jean.muamba@saintjoseph.cd')
    })
    const studentUserForChat = await db.query.users.findFirst({
        where: eq(users.email, 'marie.kabila@saintjoseph.cd')
    })
    const student2UserForChat = await db.query.users.findFirst({
        where: eq(users.email, 'paul.kabila@saintjoseph.cd')
    })
    const adminUserForChat = await db.query.users.findFirst({
        where: eq(users.email, 'admin@saintjoseph.cd')
    })

    if (teacherUserForChat && studentUserForChat && student2UserForChat && adminUserForChat) {

        const [existingDm] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'dm'),
                eq(conversations.createdBy, teacherUserForChat.id),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        const dm = existingDm ?? (await db.insert(conversations).values({
            type: 'dm',
            subSchoolId: subSchool.id,
            createdBy: teacherUserForChat.id,
        }).returning())[0]

        await db.insert(conversationMembers).values([
            { conversationId: dm.id, userId: teacherUserForChat.id, role: 'admin' },
            { conversationId: dm.id, userId: studentUserForChat.id, role: 'member' },
        ]).onConflictDoNothing()

        await db.insert(messages).values([
            {
                conversationId: dm.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Bonjour Marie, as-tu terminé les exercices du chapitre 3 ?',
            },
            {
                conversationId: dm.id,
                senderId: studentUserForChat.id,
                type: 'text',
                content: 'Oui professeur, je les ai finis hier soir !',
            },
            {
                conversationId: dm.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Parfait, apporte-les demain en classe.',
            },
        ]).onConflictDoNothing()

        console.log('✓ DM conversation créée: Prof → Marie')

        const [existingClassGroup] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'class'),
                eq(conversations.name, '1ère Année Secondaire A'),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        const classGroup = existingClassGroup ?? (await db.insert(conversations).values({
            type: 'class',
            name: '1ère Année Secondaire A',
            description: 'Groupe officiel de la classe 1ère Secondaire A',
            classId: classA.id,
            subSchoolId: subSchool.id,
            createdBy: teacherUserForChat.id,
        }).returning())[0]

        await db.insert(conversationMembers).values([
            { conversationId: classGroup.id, userId: teacherUserForChat.id, role: 'admin' },
            { conversationId: classGroup.id, userId: studentUserForChat.id, role: 'member' },
            { conversationId: classGroup.id, userId: student2UserForChat.id, role: 'member' },
        ]).onConflictDoNothing()

        await db.insert(messages).values([
            {
                conversationId: classGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Bienvenue dans le groupe de la 1ère Secondaire A 🎓',
            },
            {
                conversationId: classGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'L\'examen de mathématiques aura lieu le 20 novembre. Préparez-vous bien !',
            },
            {
                conversationId: classGroup.id,
                senderId: studentUserForChat.id,
                type: 'text',
                content: 'Merci professeur, on va bien réviser.',
            },
            {
                conversationId: classGroup.id,
                senderId: student2UserForChat.id,
                type: 'text',
                content: 'Est-ce que les exercices du chapitre 4 sont inclus ?',
            },
            {
                conversationId: classGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Oui, chapitres 3 et 4 sont au programme.',
            },
        ]).onConflictDoNothing()

        console.log('✓ Groupe classe créé: 1ère Secondaire A')

        const [existingCourseGroup] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'course'),
                eq(conversations.name, 'Mathématiques'),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        const courseGroup = existingCourseGroup ?? (await db.insert(conversations).values({
            type: 'course',
            name: 'Mathématiques',
            description: 'Groupe du cours de Mathématiques',
            courseId: mathCourseForExam.id,
            subSchoolId: subSchool.id,
            createdBy: teacherUserForChat.id,
        }).returning())[0]

        await db.insert(conversationMembers).values([
            { conversationId: courseGroup.id, userId: teacherUserForChat.id, role: 'admin' },
            { conversationId: courseGroup.id, userId: studentUserForChat.id, role: 'member' },
            { conversationId: courseGroup.id, userId: student2UserForChat.id, role: 'member' },
        ]).onConflictDoNothing()

        await db.insert(messages).values([
            {
                conversationId: courseGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Voici le groupe dédié au cours de Mathématiques.',
            },
            {
                conversationId: courseGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Posez vos questions ici, je répondrai dès que possible.',
            },
            {
                conversationId: courseGroup.id,
                senderId: studentUserForChat.id,
                type: 'text',
                content: 'Professeur, je ne comprends pas l\'exercice 5 du chapitre 3.',
            },
            {
                conversationId: courseGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Je vais t\'expliquer demain avant le cours. Viens 15 min avant.',
            },
        ]).onConflictDoNothing()

        console.log('✓ Groupe cours créé: Mathématiques')

        const [existingGeneralGroup] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'group'),
                eq(conversations.name, 'Annonces — Saint-Joseph'),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        const generalGroup = existingGeneralGroup ?? (await db.insert(conversations).values({
            type: 'group',
            name: 'Annonces — Saint-Joseph',
            description: 'Annonces officielles de l\'école',
            subSchoolId: subSchool.id,
            createdBy: adminUserForChat.id,
        }).returning())[0]

        await db.insert(conversationMembers).values([
            { conversationId: generalGroup.id, userId: adminUserForChat.id,      role: 'admin' },
            { conversationId: generalGroup.id, userId: teacherUserForChat.id,    role: 'member' },
            { conversationId: generalGroup.id, userId: studentUserForChat.id,    role: 'member' },
            { conversationId: generalGroup.id, userId: student2UserForChat.id,   role: 'member' },
        ]).onConflictDoNothing()

        await db.insert(messages).values([
            {
                conversationId: generalGroup.id,
                senderId: adminUserForChat.id,
                type: 'text',
                content: 'Bienvenue sur la plateforme de communication du Groupe Scolaire Saint-Joseph ! 🏫',
            },
            {
                conversationId: generalGroup.id,
                senderId: adminUserForChat.id,
                type: 'text',
                content: 'Les cours du lundi 11 novembre sont suspendus en raison de la fête nationale.',
            },
            {
                conversationId: generalGroup.id,
                senderId: teacherUserForChat.id,
                type: 'text',
                content: 'Merci pour l\'information !',
            },
        ]).onConflictDoNothing()

        console.log('✓ Groupe général créé: Annonces Saint-Joseph')

    } else {
        console.log('⚠ Users manquants, skip chat seed')
    }

    if (teacherUserForChat && studentUserForChat && student2UserForChat && adminUserForChat) {

        const [mathGroup] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'course'),
                eq(conversations.name, 'Mathématiques'),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        if (mathGroup) {
            const [existingSubjectMsg] = await db.select().from(messages)
                .where(and(
                    eq(messages.conversationId, mathGroup.id),
                    eq(messages.subject, 'Rappel — Examen du 20 novembre'),
                ))

            let rootMessage
            if (!existingSubjectMsg) {
                const [inserted] = await db.insert(messages).values({
                    conversationId: mathGroup.id,
                    senderId:       teacherUserForChat.id,
                    type:           'text',
                    subject:        'Rappel — Examen du 20 novembre',
                    content:        'Bonjour à tous, je vous rappelle que l\'examen final de mathématiques aura lieu le 20 novembre. Les chapitres 3 et 4 sont au programme. Préparez-vous bien et n\'hésitez pas à poser vos questions ici.',
                }).returning()
                rootMessage = inserted
                console.log('✓ Message avec subject créé')
            } else {
                rootMessage = existingSubjectMsg
                console.log('~ Message avec subject déjà existant')
            }

            if (rootMessage) {
                const threadReplies = [
                    {
                        conversationId: mathGroup.id,
                        senderId:       studentUserForChat.id,
                        type:           'text' as const,
                        content:        'Merci professeur ! Est-ce que les exercices du chapitre 4.3 sont inclus ?',
                        threadId:       rootMessage.id,
                    },
                    {
                        conversationId: mathGroup.id,
                        senderId:       teacherUserForChat.id,
                        type:           'text' as const,
                        content:        'Oui Marie, tout le chapitre 4 est au programme y compris le 4.3.',
                        threadId:       rootMessage.id,
                    },
                    {
                        conversationId: mathGroup.id,
                        senderId:       student2UserForChat.id,
                        type:           'text' as const,
                        content:        'Est-ce qu\'on peut utiliser la calculatrice ?',
                        threadId:       rootMessage.id,
                    },
                    {
                        conversationId: mathGroup.id,
                        senderId:       teacherUserForChat.id,
                        type:           'text' as const,
                        content:        'Non Paul, l\'examen se fait sans calculatrice.',
                        threadId:       rootMessage.id,
                    },
                ]

                for (const reply of threadReplies) {
                    const [existing] = await db.select().from(messages)
                        .where(and(
                            eq(messages.threadId, rootMessage.id),
                            eq(messages.senderId, reply.senderId),
                            eq(messages.content, reply.content!),
                        ))

                    if (!existing) {
                        await db.insert(messages).values(reply)
                        console.log(`✓ Thread reply créée`)
                    } else {
                        console.log(`~ Thread reply déjà existante`)
                    }
                }

                await db.insert(messageStars)
                    .values({ messageId: rootMessage.id, userId: teacherUserForChat.id })
                    .onConflictDoNothing()
                console.log('✓ Message starré par le prof')

                await db.insert(messageArchives)
                    .values({ messageId: rootMessage.id, userId: adminUserForChat.id })
                    .onConflictDoNothing()
                console.log('✓ Message archivé par l\'admin')
            }

            const [announcesGroup] = await db.select().from(conversations)
                .where(and(
                    eq(conversations.type, 'group'),
                    eq(conversations.name, 'Annonces — Saint-Joseph'),
                    eq(conversations.subSchoolId, subSchool.id),
                ))

            if (announcesGroup) {
                const [originalMsg] = await db.select().from(messages)
                    .where(eq(messages.conversationId, announcesGroup.id))
                    .limit(1)

                if (originalMsg) {
                    const [existingForward] = await db.select().from(messages)
                        .where(and(
                            eq(messages.forwardedFrom, originalMsg.id),
                            eq(messages.conversationId, mathGroup.id),
                        ))

                    if (!existingForward) {
                        await db.insert(messages).values({
                            conversationId: mathGroup.id,
                            senderId:       teacherUserForChat.id,
                            type:           'text',
                            content:        originalMsg.content,
                            forwardedFrom:  originalMsg.id,
                        })
                        console.log('✓ Message forwardé créé')
                    } else {
                        console.log('~ Message forwardé déjà existant')
                    }
                }
            }
        }

        const [dmConv] = await db.select().from(conversations)
            .where(and(
                eq(conversations.type, 'dm'),
                eq(conversations.createdBy, teacherUserForChat.id),
                eq(conversations.subSchoolId, subSchool.id),
            ))

        if (dmConv) {
            const [firstDmMsg] = await db.select().from(messages)
                .where(eq(messages.conversationId, dmConv.id))
                .limit(1)

            if (firstDmMsg) {
                await db.insert(messageStars)
                    .values({ messageId: firstDmMsg.id, userId: studentUserForChat.id })
                    .onConflictDoNothing()
                console.log('✓ DM message starré par l\'élève')
            }
        }

    } else {
        console.log('⚠ Users manquants, skip thread/stars/archives seed')
    }

    const [mathMsg] = await db.select().from(messages)
        .where(eq(messages.subject, 'Rappel — Examen du 20 novembre'))
        .limit(1)

    if (mathMsg) {
        const [existingAttachment] = await db.select().from(messageAttachments)
            .where(eq(messageAttachments.messageId, mathMsg.id))

        if (!existingAttachment) {
            const bucketName = `school-${subSchool.id}`

            await db.insert(messageAttachments).values([
                {
                    messageId: mathMsg.id,
                    bucketName,
                    key:       `chats/${mathMsg.conversationId}/sample-doc.pdf`,
                    url:       `http://localhost:9000/school-chat/chats/${mathMsg.conversationId}/sample-doc.pdf`,
                    filename:  'Programme-examen-novembre.pdf',
                    mimeType:  'application/pdf',
                    size:      102400,
                },
                {
                    messageId: mathMsg.id,
                    bucketName,
                    key:       `chats/${mathMsg.conversationId}/sample-image.jpg`,
                    url:       `http://localhost:9000/school-chat/chats/${mathMsg.conversationId}/sample-image.jpg`,
                    filename:  'formules-mathematiques.jpg',
                    mimeType:  'image/jpeg',
                    size:      204800,
                    width:     1920,
                    height:    1080,
                },
            ])
            console.log('✓ Attachments créés pour le message Math')
        } else {
            console.log('~ Attachments déjà existants')
        }
    }

    console.log('\n✓ Seed completed. Test credentials (password: password123):');
    console.log('  Admin   → admin@saintjoseph.cd');
    console.log('  Director   → directeur@saintjoseph.cd');
    console.log('  Staff(Worker)      → secretaire@saintjoseph.cd');
    console.log('  Student → marie.kabila@saintjoseph.cd');
    console.log('  Teacher → jean.muamba@saintjoseph.cd');

    process.exit(0);
}

seed().catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exit(1);
});