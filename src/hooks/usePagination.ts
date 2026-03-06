import { useState } from 'react'

export function usePagination(initialPage = 0) {
  const [page, setPage] = useState(initialPage)

  function goToPage(p: number) {
    setPage(p)
  }

  function nextPage() {
    setPage((p) => p + 1)
  }

  function prevPage() {
    setPage((p) => Math.max(0, p - 1))
  }

  function reset() {
    setPage(0)
  }

  return { page, goToPage, nextPage, prevPage, reset }
}
