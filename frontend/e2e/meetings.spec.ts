import { expect, test, type Locator } from '@playwright/test'

type SlotWindow = {
  days: { slots: { start: string }[] }[]
}

test('владелец видит забронированную встречу в списке', async ({
  page,
  request,
}) => {
  const id = `meetings-${Date.now()}`
  const created = await request.post('/api/event-types', {
    data: {
      id,
      title: 'Список встреч',
      description: '',
      durationMinutes: 60,
    },
  })
  expect(created.ok()).toBeTruthy()

  const windowResponse = await request.get(`/api/event-types/${id}/slots`)
  const window = (await windowResponse.json()) as SlotWindow
  // Бронируем последний слот окна: ранние слоты проверяют другие браузерные сценарии.
  const start = window.days.flatMap((day) => day.slots).at(-1)!.start
  const email = `${id}@example.com`

  const booking = await request.post('/api/bookings', {
    data: {
      eventTypeId: id,
      start,
      guestName: 'Гость списка',
      guestEmail: email,
      topic: 'Из теста списка',
    },
  })
  expect(booking.ok()).toBeTruthy()

  await page.goto('/admin/meetings')

  const row = page
    .getByRole('list', { name: 'Предстоящие встречи' })
    .getByRole('listitem')
    .filter({ hasText: email })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Список встреч')
  await expect(row).toContainText('Гость списка')
  await expect(row).toContainText('Тема разговора: Из теста списка')
  await expect(row).toContainText(/\d{2}:\d{2}/)
})

test('встречи идут в одну колонку на узком экране и в две на широком', async ({
  page,
  request,
}) => {
  const id = `meetings-grid-${Date.now()}`
  const created = await request.post('/api/event-types', {
    data: {
      id,
      title: 'Сетка встреч',
      description: '',
      durationMinutes: 60,
    },
  })
  expect(created.ok()).toBeTruthy()

  const windowResponse = await request.get(`/api/event-types/${id}/slots`)
  const window = (await windowResponse.json()) as SlotWindow
  // Бронируем последний слот окна: ранние слоты проверяют другие браузерные сценарии.
  const start = window.days.flatMap((day) => day.slots).at(-1)!.start
  const email = `${id}@example.com`

  const booking = await request.post('/api/bookings', {
    data: {
      eventTypeId: id,
      start,
      guestName: 'Гость сетки',
      guestEmail: email,
      topic: 'Из теста сетки',
    },
  })
  expect(booking.ok()).toBeTruthy()

  await page.setViewportSize({ width: 480, height: 800 })
  await page.goto('/admin/meetings')

  const list = page.getByRole('list', { name: 'Предстоящие встречи' })
  const row = list.getByRole('listitem').filter({ hasText: email })
  await expect(row).toBeVisible()
  await expect.poll(() => countColumns(list)).toBe(1)

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect.poll(() => countColumns(list)).toBe(2)

  const link = row.getByRole('link', { name: email })
  await expect(link).toHaveAttribute('href', `mailto:${email}`)
  await expect(link).toHaveClass(/text-blue-600/)
})

async function countColumns(list: Locator) {
  return list.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
  )
}
