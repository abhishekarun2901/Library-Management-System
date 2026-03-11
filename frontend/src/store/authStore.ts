import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthRole = 'admin' | 'member' | null

export type AuthState = {
  userId: string | null
  role: AuthRole
  fullName: string | null
  memberSince: string | null
  isAuthenticated: boolean
}

export type AuthActions = {
  setAuth: (payload: {
    userId: string | null
    role: AuthRole
    fullName: string | null
    memberSince: string | null
  }) => void
  logout: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  userId: null,
  role: null,
  fullName: null,
  memberSince: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: ({ userId, role, fullName, memberSince }) =>
        set({ userId, role, fullName, memberSince, isAuthenticated: true }),

      logout: () => set(initialState),
    }),
    {
      name: 'lbms-auth', // localStorage key
      version: 3, // bumped — schema changed (token → userId)
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        fullName: state.fullName,
        memberSince: state.memberSince,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
