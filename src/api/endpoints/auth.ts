import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  EmailOnlyRequest,
} from '@/api/app-types'

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
    mutationFn: (payload: RegisterRequest) =>
      client.post<{ message: string }>('/api/auth/register', payload).then((r) => r.data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: EmailOnlyRequest) =>
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
    mutationFn: (payload: EmailOnlyRequest) =>
      client.post('/api/auth/resend-verification', payload).then((r) => r.data),
  })
}
