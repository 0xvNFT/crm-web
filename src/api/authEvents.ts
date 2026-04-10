/**
 * Tiny event emitter bridging the Axios interceptor (outside React) to AuthProvider (inside React).
 *
 * Why: The Axios interceptor runs outside the React component tree and has no access to
 * React Router's `navigate`. A module-level event emitter decouples them — the interceptor
 * fires the event; AuthProvider subscribes and calls `navigate('/login')` via React Router.
 *
 * This avoids `window.location.href = '/login'` which causes a full page reload,
 * destroying all React state, form data, and React Query cache.
 */
type Listener = () => void

let unauthorizedListeners: Listener[] = []

export const authEvents = {
  onUnauthorized(listener: Listener) {
    unauthorizedListeners.push(listener)
    return () => {
      unauthorizedListeners = unauthorizedListeners.filter((l) => l !== listener)
    }
  },
  emitUnauthorized() {
    unauthorizedListeners.forEach((l) => l())
  },
}
