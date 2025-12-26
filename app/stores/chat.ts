import { defineStore } from 'pinia'

export interface User {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline'
}

export interface Message {
    id: string
    senderId: string
    text: string
    timestamp: Date
    isRead: boolean
}

export interface Task {
    id: string
    title: string
    status: 'pending' | 'completed'
}

export interface Debt {
    id: string
    amount: number
    description: string
    whoOwes: 'me' | 'them'
}

export interface Conversation {
    id: string
    contactId: string // The ID of the other user in the chat
    messages: Message[]
    unreadCount: number
    lastMessage?: Message
    tasks: Task[]
    debts: Debt[]
}

export const useChatStore = defineStore('chat', () => {
    // Mock Data
    const currentUser = ref<User>({
        id: 'me',
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?u=me',
        status: 'online'
    })

    // Contacts mock
    const contacts = ref<User[]>([
        { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online' },
        { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=2', status: 'offline' },
        { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online' }
    ])

    // Conversations mock
    const conversations = ref<Conversation[]>([
        {
            id: 'c1',
            contactId: '1',
            unreadCount: 2,
            messages: [
                { id: 'm1', senderId: '1', text: 'Hey there!', timestamp: new Date(Date.now() - 10000000), isRead: true },
                { id: 'm2', senderId: 'me', text: 'Hello! How are you?', timestamp: new Date(Date.now() - 9000000), isRead: true },
                { id: 'm3', senderId: '1', text: 'I am good, thanks! And you?', timestamp: new Date(Date.now() - 8000000), isRead: false },
                { id: 'm4', senderId: '1', text: 'working on that project?', timestamp: new Date(Date.now() - 7000000), isRead: false }
            ],
            tasks: [
                { id: 't1', title: 'Buy groceries', status: 'pending' },
                { id: 't2', title: 'Send project report', status: 'completed' }
            ],
            debts: [
                { id: 'd1', amount: 250, description: 'Lunch at Burger King', whoOwes: 'them' },
                { id: 'd2', amount: 50, description: 'Coffee', whoOwes: 'me' }
            ]
        },
        {
            id: 'c2',
            contactId: '2',
            unreadCount: 0,
            messages: [
                { id: 'm5', senderId: 'me', text: 'Meeting is at 3pm.', timestamp: new Date(Date.now() - 86400000), isRead: true },
                { id: 'm6', senderId: '2', text: 'Got it.', timestamp: new Date(Date.now() - 86000000), isRead: true }
            ],
            tasks: [],
            debts: []
        }
    ])

    const activeConversationId = ref<string | null>(null)

    const activeConversation = computed(() =>
        conversations.value.find(c => c.id === activeConversationId.value)
    )

    const activeContact = computed(() => {
        if (!activeConversation.value) return null
        return contacts.value.find(u => u.id === activeConversation.value?.contactId)
    })

    function setActiveConversation(conversationId: string) {
        activeConversationId.value = conversationId
    }

    function sendMessage(text: string) {
        if (!activeConversationId.value || !currentUser.value) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUser.value.id,
            text,
            timestamp: new Date(),
            isRead: false,
        };

        // Optimistically update UI
        const conversation = conversations.value.find(c => c.id === activeConversationId.value);
        if (conversation) {
            conversation.messages.push(newMessage);

            // Emit to server
            const { $socket } = useNuxtApp();
            $socket.emit('message:send', {
                conversationId: conversation.id,
                message: newMessage
            });
        }
    }

    // Initialize Socket Listeners
    if (import.meta.client) {
        const { $socket } = useNuxtApp();

        $socket.on('message:received', (data: { conversationId: string, message: Message }) => {
            // Don't duplicate if we just sent it (optimistic UI)
            if (data.message.senderId === currentUser.value?.id) return;

            const conversation = conversations.value.find(c => c.id === data.conversationId);
            if (conversation) {
                conversation.messages.push({
                    ...data.message,
                    timestamp: new Date(data.message.timestamp) // Rehydrate date
                });

                if (activeConversationId.value !== conversation.id) {
                    conversation.unreadCount++;
                }
            }
        });

        $socket.on('connect', () => {
            console.log('Socket connected:', $socket.id);
        });
    }
    return {
        currentUser,
        contacts,
        conversations,
        activeConversationId,
        activeConversation,
        activeContact,
        setActiveConversation,
        sendMessage
    }
})
