import { defineStore } from 'pinia'
import { useDataStore } from '~/stores/data'
import type { Task } from '~/stores/data'

interface User {
    id: number
    username: string
    email: string
    avatar?: string
}

interface Message {
    id: number
    content: string
    sender_id: number
    receiver_id: number
    created_at: string
    ai_analysis?: any
    status: 'sent' | 'delivered' | 'read'
}

interface DebtRecord {
    id: number
    debtor_id: number
    creditor_id: number
    amount: number
    status: 'active' | 'settled'
    created_at: string
}

interface ConversationDebt {
    id: number
    whoOwes: 'me' | 'other'
    description: string
    amount: number
    created_at: string
}

interface Conversation {
    id: number
    user: User
    lastMessage: Message
    unreadCount: number
    messages: Message[]
    tasks?: Task[]
    debts?: ConversationDebt[]
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [] as Conversation[],
        activeConversationId: null as number | null,
        socket: null as WebSocket | null,
        isConnected: false,
        isLoadingMessages: false // New state
    }),

    getters: {
        activeConversation: (state) =>
            state.conversations.find(c => c.id === state.activeConversationId)
    },

    actions: {
        async initialize() {
            const auth = useAuthStore()
            if (!auth.token) return

            if (!auth.user) {
                await auth.fetchUser()
            }

            await this.fetchConversations()
            await this.refreshTasks()
            await this.refreshDebts()
            this.connectWebSocket(auth.token)

            // Restore active conversation from cookie
            const cookie = useCookie<number | null>('active_conversation_id')
            if (cookie.value) {
                this.setActiveConversation(cookie.value)
            }
        },

        async fetchConversations() {
            const auth = useAuthStore()
            if (!auth.token) return

            try {
                const users = await $fetch<User[]>('/api/users/', {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })

                if (users) {
                    this.conversations = users
                        .filter(u => u.id !== auth.user?.id)
                        .map(u => ({
                            id: u.id,
                            user: u,
                            lastMessage: { content: 'Sohbeti başlat' } as Message,
                            unreadCount: 0,
                            messages: []
                        }))
                }
            } catch (e) {
                console.error('Failed to fetch conversations:', e)
            }
        },

        async fetchMessages(userId: number) {
            const auth = useAuthStore()
            if (!auth.token) return

            this.isLoadingMessages = true
            try {
                const data = await $fetch<Message[]>('/api/messages/', {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    query: { other_user_id: userId, limit: 50 }
                })

                if (data) {
                    const conversation = this.conversations.find(c => c.id === userId)
                    if (conversation) {
                        conversation.messages = [...data].reverse().map(m => ({
                            ...m,
                            status: 'read' as const
                        }))

                        if (conversation.messages.length > 0) {
                            conversation.lastMessage = conversation.messages[conversation.messages.length - 1]!
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to fetch messages:', e)
            } finally {
                this.isLoadingMessages = false
            }
        },

        connectWebSocket(token: string) {
            if (this.socket) {
                this.socket.close()
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const runtimeConfig = useRuntimeConfig()
            let wsBase = runtimeConfig.public.wsBase

            if (!wsBase) {
                const devHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname
                wsBase = import.meta.dev
                    ? `${protocol}//${devHost}:8000`
                    : `${protocol}//${window.location.host}`
            }

            const wsUrl = `${wsBase}/ws/${token}`

            this.socket = new WebSocket(wsUrl)

            this.socket.onopen = () => {
                console.log('WS Connected')
                this.isConnected = true
            }

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                this.handleSocketMessage(data)
            }

            this.socket.onclose = () => {
                console.log('WS Disconnected')
                this.isConnected = false
            }
        },

        handleSocketMessage(data: any) {
            if (data.type === 'message') {
                const otherUserId = data.sender_id === useAuthStore().user?.id ? data.receiver_id : data.sender_id
                const conversation = this.conversations.find(c => c.id === otherUserId)

                if (conversation) {
                    const message: Message = {
                        id: data.id,
                        content: data.content,
                        sender_id: data.sender_id,
                        receiver_id: data.receiver_id,
                        created_at: data.created_at,
                        ai_analysis: data.ai_analysis,
                        status: 'read'
                    }
                    conversation.messages.push(message)
                    conversation.lastMessage = message

                    if (this.activeConversationId !== conversation.id) {
                        conversation.unreadCount++
                    }
                }

                if (data.ai_analysis?.type === 'task' || data.ai_analysis?.type === 'expense') {
                    this.refreshTasks()
                    if (data.ai_analysis?.type === 'expense') {
                        this.refreshDebts()
                        this.refreshBalance()
                    }
                }
            } else if (data.type === 'notification') {
                if (data.task_id) {
                    this.refreshTasks()
                }
                if (data.debt_id) {
                    this.refreshDebts()
                    this.refreshBalance()
                }
            }
        },

        sendMessage(content: string) {
            if (!this.socket || !this.activeConversationId || this.socket.readyState !== WebSocket.OPEN) return

            const payload = {
                receiver_id: this.activeConversationId,
                content: content
            }

            this.socket.send(JSON.stringify(payload))
        },

        setActiveConversation(id: number) {
            this.activeConversationId = id
            const conv = this.conversations.find(c => c.id === id)
            if (conv) {
                conv.unreadCount = 0
                // Fetch messages when switching to this conversation
                this.fetchMessages(id)
            }

            // Persist to cookie
            const cookie = useCookie<number | null>('active_conversation_id')
            cookie.value = id
        },

        async refreshTasks() {
            const auth = useAuthStore()
            if (!auth.token) return

            try {
                const tasks = await $fetch<Task[]>('/api/tasks/', {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })

                this.conversations = this.conversations.map((conversation) => ({
                    ...conversation,
                    tasks: tasks.filter(
                        task => task.created_by === conversation.id || task.assigned_to === conversation.id
                    )
                }))
            } catch (e) {
                console.error('Failed to refresh tasks:', e)
            }
        },

        async refreshBalance() {
            const auth = useAuthStore()
            if (!auth.token) return

            const dataStore = useDataStore()
            try {
                await dataStore.fetchBalance()
            } catch (e) {
                console.error('Failed to refresh balance:', e)
            }
        },

        async refreshDebts() {
            const auth = useAuthStore()
            if (!auth.token) return
            if (!auth.user) {
                await auth.fetchUser()
            }
            const currentUserId = auth.user?.id
            if (!currentUserId) return

            try {
                const debts = await $fetch<DebtRecord[]>('/api/debts/history', {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    query: { status_filter: 'active', limit: 100 }
                })

                const nextConversations = this.conversations.map((conversation) => {
                    const conversationDebts = debts
                        .filter(
                            debt =>
                                debt.debtor_id === conversation.id ||
                                debt.creditor_id === conversation.id
                        )
                        .map((debt) => {
                            const isMeDebtor = debt.debtor_id === currentUserId
                            return {
                                id: debt.id,
                                whoOwes: isMeDebtor ? 'me' : 'other',
                                description: isMeDebtor
                                    ? `${conversation.user.username} kişisine borç`
                                    : `${conversation.user.username} sana borçlu`,
                                amount: debt.amount,
                                created_at: debt.created_at
                            }
                        })
                        .sort((a, b) => b.created_at.localeCompare(a.created_at))

                    return {
                        ...conversation,
                        debts: conversationDebts
                    }
                })

                this.conversations = nextConversations
            } catch (e) {
                console.error('Failed to refresh debts:', e)
            }
        }
    }
})
