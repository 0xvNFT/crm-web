import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  EmailOnlyRequest,
} from '@/api/app-types'

// Session restore — called once on mount to rehydrate auth from httpOnly cookie.
// staleTime: Infinity so it never auto-refetches, but invalidateQueries(['me']) forces refresh after profile updates.
// retry: false so a 401 immediately resolves to null user (not logged in), not retried 3x.
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => client.get<AuthUser>('/api/v1/auth/me').then((r) => r.data),
    retry: false,
    staleTime: Infinity,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      client.post<AuthUser>('/api/v1/auth/login', payload).then((r) => r.data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => client.post('/api/v1/auth/logout').then((r) => r.data),
  })
}

// Only active when VITE_REGISTRATION_ENABLED=true.
// POST /api/v1/auth/register is hidden (APP_REGISTRATION_ENABLED=false) in deployments where tenant provisioning is managed externally.
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) =>
      client.post<{ message: string }>('/api/v1/auth/register', payload).then((r) => r.data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: EmailOnlyRequest) =>
      client.post('/api/v1/auth/forgot-password', payload).then((r) => r.data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      client.post('/api/v1/auth/reset-password', payload).then((r) => r.data),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      client.put('/api/v1/auth/profile', payload).then((r) => r.data),
    // Invalidate any cached /me data so AuthContext re-fetches updated name
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      client.post('/api/v1/auth/change-password', payload).then((r) => r.data),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: EmailOnlyRequest) =>
      client.post('/api/v1/auth/resend-verification', payload).then((r) => r.data),
  })
}

export function useVerifyEmail(token: string) {
  return useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => client.get('/api/v1/auth/verify', { params: { token } }).then((r) => r.data),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      client.post('/api/v1/auth/accept-invite', payload).then((r) => r.data),
  })
}
