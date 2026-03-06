import { useMutation } from '@tanstack/react-query'
import client from '@/api/client'
import type { AuthResponse } from '@/api/app-types'
import type { components } from '@/api/types'

type LoginRequest = components['schemas']['LoginRequest']
type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']

interface ForgotPasswordPayload {
  email: string
}

interface ResetPasswordPayload {
  token: string
  password: string
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      client.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => client.post('/api/auth/logout').then((r) => r.data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      client.post('/api/auth/forgot-password', payload).then((r) => r.data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      client.post('/api/auth/reset-password', payload).then((r) => r.data),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      client.post('/api/auth/change-password', payload).then((r) => r.data),
  })
}
