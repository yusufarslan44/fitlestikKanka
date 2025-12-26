import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
    const socket = io({
        path: '/socket.io',
        autoConnect: true
    })

    return {
        provide: {
            socket
        }
    }
})
