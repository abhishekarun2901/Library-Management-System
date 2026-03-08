import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthRole = 'admin' | 'member' | null

export type AuthState = {
  token: string | null
  role: AuthRole
  fullName: string | null
  memberSince: string | null
  isAuthenticated: boolean
}

export type AuthActions = {
  setAuth: (payload: {
    token: string
    role: AuthRole
    fullName: string | null
    memberSince: string | null
  }) => void
  logout: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  token: null,
  role: null,
  fullName: null,
  memberSince: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: ({ token, role, fullName, memberSince }) =>
        set({ token, role, fullName, memberSince, isAuthenticated: true }),

      logout: () => set(initialState),
    }),
    {
      name: 'lbms-auth', // localStorage key
      version: 2, // bump when auth schema changes to clear stale state
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        fullName: state.fullName,
        memberSince: state.memberSince,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
