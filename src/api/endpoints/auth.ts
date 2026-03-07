import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { AuthUser, UpdateProfileRequest } from '@/api/app-types'
import type { components } from '@/api/types'

type LoginRequest = components['schemas']['LoginRequest']
type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      client.post<AuthUser>('/api/auth/login', payload).then((r) => r.data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => client.post('/api/auth/logout').then((r) => r.data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: {
      tenantName: string
      tenantSlug: string
      vertical: string
      firstName: string
      lastName: string
      email: string
      password: string
    }) => client.post<{ message: string }>('/api/auth/register', payload).then((r) => r.data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      client.post('/api/auth/forgot-password', payload).then((r) => r.data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      client.post('/api/auth/reset-password', payload).then((r) => r.data),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      client.put('/api/auth/profile', payload).then((r) => r.data),
    // Invalidate any cached /me data so AuthContext re-fetches updated name
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      client.post('/api/auth/change-password', payload).then((r) => r.data),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      client.post('/api/auth/resend-verification', payload).then((r) => r.data),
  })
}
