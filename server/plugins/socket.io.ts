import type { NitroApp } from 'nitropack'
import { Server as SocketServer } from 'socket.io'
import type { Server } from 'http'

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const socketServer = new SocketServer({
        path: '/socket.io',
        serveClient: false,
        cors: {
            origin: '*',
        }
    })

    nitroApp.router.use('/socket.io/', defineEventHandler((event) => {
        // @ts-expect-error - socket types
        if (!socketServer.engine && event.node.req.socket?.server) {
            // @ts-expect-error - socket types
            socketServer.attach(event.node.req.socket.server)
            console.log('Socket.IO attached to server')
        }

        if (socketServer.engine) {
            // @ts-expect-error - engine is not typed
            socketServer.engine.handleRequest(event.node.req, event.node.res)
            event._handled = true
        } else {
            console.error('Socket.IO failed to attach: No engine or server found')
        }
    }))

    socketServer.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })

        // Relay messages
        socket.on('message:send', (data) => {
            socketServer.emit('message:received', data)
        })
    })

    console.log('Socket.IO server initialized')
})
