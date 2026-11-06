// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'

import App from '@/App'

vi.mock('@/api/client', () => ({
  api: {
    GET: vi.fn().mockResolvedValue({ data: [], response: new Response() }),
  },
}))

afterEach(cleanup)

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test.each(['/', '/book', '/admin', '/privacy'])(
  'подвал виден на маршруте %s',
  (path) => {
    renderAt(path)

    expect(screen.getByRole('contentinfo')).toBeTruthy()
  },
)

test('подвал содержит текущий год и название сервиса', () => {
  renderAt('/')

  const year = new Date().getFullYear()
  expect(screen.getByRole('contentinfo').textContent).toContain(
    `© ${year} Календарь звонков`,
  )
})

test('ссылка «Политика конфиденциальности» ведёт на /privacy в новой вкладке', () => {
  renderAt('/')

  const link = screen.getByRole('link', { name: 'Политика конфиденциальности' })
  expect(link.getAttribute('href')).toBe('/privacy')
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.getAttribute('rel')).toContain('noopener')
})

test('страница /privacy показывает политику не длиннее 1000 символов', () => {
  renderAt('/privacy')

  expect(
    screen.getByRole('heading', { level: 1, name: 'Политика конфиденциальности' }),
  ).toBeTruthy()

  const text = screen.getByRole('main').textContent ?? ''
  expect(text).toContain('имя')
  expect(text).toContain('адрес электронной почты')
  expect(text.length).toBeLessThanOrEqual(1000)
})
