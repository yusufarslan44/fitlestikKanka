import { defineStore } from 'pinia'

interface User {
    id: number
    username: string
    email: string
    created_at?: string
}

interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: useCookie('auth_token').value || null,
        loading: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.token
    },

    actions: {
        async login(username: string, password: string) {
            this.loading = true
            try {
                const formData = new FormData()
                formData.append('username', username)
                formData.append('password', password)

                const data = await $fetch<{ access_token: string }>('/api/auth/login', {
                    method: 'POST',
                    body: formData
                })

                this.token = data.access_token
                const cookie = useCookie('auth_token')
                cookie.value = data.access_token
                await this.fetchUser()
                return true
            } catch (e) {
                console.error('Login failed:', e)
                return false
            } finally {
                this.loading = false
            }
        },

        async register(userData: { username: string; email: string; password: string }) {
            this.loading = true
            try {
                await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: userData
                })
                return true
            } catch (e) {
                console.error('Registration failed:', e)
                return false
            } finally {
                this.loading = false
            }
        },

        async fetchUser() {
            if (!this.token) return

            try {
                const data = await $fetch<User>('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                })

                this.user = data
            } catch (e: any) {
                console.error('Fetch user failed:', e)
                if (e.status === 401) {
                    this.logout()
                }
            }
        },

        logout() {
            this.user = null
            this.token = null
            const cookie = useCookie('auth_token')
            cookie.value = null
            navigateTo('/login')
        }
    }
})
