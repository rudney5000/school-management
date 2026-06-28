import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { env } from '@/config/env'
import { registerChatHandlers } from './handlers/chat.handler'
import { socketAuthMiddleware } from './middleware/socket-auth'
import {redisClient} from "@/lib/redis";

let io: SocketServer

export function initSocketServer(httpServer: HttpServer): SocketServer {
    io = new SocketServer(httpServer, {
        cors: {
            origin: env.ALLOWED_ORIGINS,
            credentials: true,
        },
    })

    const pubClient = redisClient
    const subClient = redisClient.duplicate()

    io.adapter(createAdapter(pubClient, subClient))

    io.use(socketAuthMiddleware)

    io.on('connection', (socket) => {
        console.log(`✓ Socket connected: ${socket.id} (user: ${socket.data.userId})`)

        pubClient.set(`online:${socket.data.userId}`, '1', 'EX', 300)

        socket.broadcast.emit('user:online', { userId: socket.data.userId })

        registerChatHandlers(io, socket, pubClient)

        socket.on('disconnect', () => {
            pubClient.del(`online:${socket.data.userId}`)
            socket.broadcast.emit('user:offline', { userId: socket.data.userId })
            console.log(`✗ Socket disconnected: ${socket.id}`)
        })
    })

    return io
}

export function getIo(): SocketServer {
    if (!io) throw new Error('Socket.io not initialized')
    return io
}