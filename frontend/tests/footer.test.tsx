// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, screen } from '@testing-library/react'

import { renderAppAt } from './render-app'

vi.mock('@/api/client', () => ({
  api: {
    GET: vi.fn().mockResolvedValue({ data: [], response: new Response() }),
  },
}))

afterEach(cleanup)

test.each(['/', '/book', '/admin', '/privacy'])(
  'подвал виден на маршруте %s',
  (path) => {
    renderAppAt(path)

    expect(screen.getByRole('contentinfo')).toBeTruthy()
  },
)

test('подвал содержит текущий год и название сервиса', () => {
  renderAppAt('/')

  const year = new Date().getFullYear()
  expect(screen.getByRole('contentinfo').textContent).toContain(
    `© ${year} Календарь звонков`,
  )
})

test('ссылка «Политика конфиденциальности» ведёт на /privacy в новой вкладке', () => {
  renderAppAt('/')

  const link = screen.getByRole('link', { name: 'Политика конфиденциальности' })
  expect(link.getAttribute('href')).toBe('/privacy')
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.getAttribute('rel')).toContain('noopener')
})

test('страница /privacy показывает политику не длиннее 1000 символов', () => {
  renderAppAt('/privacy')

  expect(
    screen.getByRole('heading', { level: 1, name: 'Политика конфиденциальности' }),
  ).toBeTruthy()

  const text = screen.getByRole('main').textContent ?? ''
  expect(text).toContain('имя')
  expect(text).toContain('адрес электронной почты')
  expect(text).toContain('тему разговора')
  expect(text).toContain('комментарий')
  expect(text).toContain('организации и проведения звонка')
  expect(text).toContain('хранятся')
  expect(text).toContain('вправе')
  expect(text.length).toBeLessThanOrEqual(1000)
})
