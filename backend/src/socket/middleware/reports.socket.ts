import { getIo } from '@/socket/socket';

export function emitToReportRoom(subSchoolId: string, event: string, payload: unknown): void {
  getIo().to(`reports:admins:${subSchoolId}`).emit(event, payload);
}

export function emitToUserRoom(userId: string, event: string, payload: unknown): void {
  getIo().to(`user:${userId}`).emit(event, payload);
}
