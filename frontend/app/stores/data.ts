import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export interface Task {
    id: number
    created_by: number
    assigned_to: number
    item_name: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    related_message_id?: number
    created_at: string
    completed_at?: string
}

export interface DebtBalance {
    user_id: number
    username: string
    total_owed: number
    total_to_collect: number
    net_balance: number
}

interface DataState {
    tasks: Task[]
    balance: DebtBalance | null
    loading: boolean
}

export const useDataStore = defineStore('data', {
    state: (): DataState => ({
        tasks: [],
        balance: null,
        loading: false
    }),

    actions: {
        async fetchTasks() {
            const auth = useAuthStore()
            if (!auth.token) return

            this.loading = true
            try {
                const { data, error } = await useFetch<Task[]>('/api/tasks/', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })

                if (error.value) throw error.value

                if (data.value) {
                    this.tasks = data.value
                }
            } catch (e) {
                console.error('Fetch tasks failed:', e)
            } finally {
                this.loading = false
            }
        },

        async fetchBalance() {
            const auth = useAuthStore()
            if (!auth.token) return

            try {
                const { data, error } = await useFetch<DebtBalance>('/api/debts/balance', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })

                if (error.value) throw error.value

                if (data.value) {
                    this.balance = data.value
                }
            } catch (e) {
                console.error('Fetch balance failed:', e)
            }
        },

        async fetchAll() {
            await Promise.all([
                this.fetchTasks(),
                this.fetchBalance()
            ])
        }
    }
})
