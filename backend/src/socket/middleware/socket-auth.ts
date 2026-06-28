import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
    const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) return next(new Error('UNAUTHORIZED'))

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
            id: string
            role: string
            subSchoolId?: string
        }
        socket.data.userId = payload.id
        socket.data.role = payload.role
        socket.data.subSchoolId = payload.subSchoolId
        next()
    } catch {
        next(new Error('UNAUTHORIZED'))
    }
}