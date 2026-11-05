# Календарь звонков (продолжение)


[![hexlet-check](https://github.com/war-beast/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/war-beast/ai-for-developers-project-387/actions)
[![check](https://github.com/war-beast/ai-for-developers-project-387/actions/workflows/check.yml/badge.svg)](https://github.com/war-beast/ai-for-developers-project-387/actions/workflows/check.yml)

Сервис записи на звонок: владелец публикует доступное время, а гость без
регистрации выбирает тип встречи и свободный слот в ближайшие 14 дней.

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

Публичная версия: https://callcalendar-615k.onrender.com

## Стек

- Бекенд: ASP.NET Core 10 (MVC), солюшен `CallCalendar.slnx`: `backend/CallCalendar` (слой представления, REST `api/`), `CallCalendar.BLL` (бизнес-логика), `CallCalendar.DAL` (доступ к данным), `CallCalendar.Tests` (xUnit.v3 + Moq)
- Фронтенд: `frontend/` — Vite + React + TypeScript, shadcn/ui, TanStack Query, react-router. Это единственный пользовательский интерфейс приложения
- Контракт API: TypeSpec (`api/main.tsp`) → OpenAPI (`api/openapi.yaml`) → клиентский SDK для TypeScript (`frontend/src/api/schema.d.ts`, генератор openapi-typescript, запросы через openapi-fetch)
- Инструменты: mise (версии в `mise.toml`), git-хуки через hk (`hk.pkl`), демоны через pitchfork

## Что уже работает

- Главная страница `/` — рассказывает про сервис
- `/book` — каталог типов встреч: название, описание, длительность
- `/book/:typeId` — свободные слоты типа встречи на 14 дней: лента дней, выбор дня и времени, форма гостя и подтверждение записи
- `/admin` — список типов и форма создания; ошибки полей приходят из API
- `/admin/meetings` — предстоящие встречи всех типов по возрастанию начала; пустое состояние, обновление при возврате на вкладку
- `GET/POST /api/event-types` — список и создание типов встреч
- `GET /api/event-types/{eventTypeId}/slots` — свободные слоты на окно записи
- `POST /api/bookings` — запись гостя на свободный слот; пересекающиеся интервалы отклоняются с `409 slot_taken`
- `GET /api/bookings` — предстоящие записи всех типов (включая идущую) по возрастанию начала
- `GET /health` — проверка живости бекенда

Данные хранятся в памяти процесса: после рестарта бекенда созданные типы
встреч и записи пропадают. Базы данных и сохранения состояния нет.

## Установка

Нужен [mise](https://mise.jdx.dev) (ставит node, pnpm, .NET SDK, линтеры) и git.

```bash
git clone https://github.com/war-beast/ai-for-developers-project-387.git
cd ai-for-developers-project-387
mise install      # установка всех инструментов из mise.toml
mise run install  # зависимости dotnet/node (frontend, api)
```

## Использование

Запуск через демоны (UI на :5173, API на :5150):

```bash
mise daemons start backend frontend
mise daemons logs backend   # смотреть вывод
mise daemons stop backend frontend
```

Генерация контракта и SDK:

```bash
mise run openapi   # TypeSpec -> openapi.yaml
mise run sdk       # openapi.yaml -> frontend/src/api/schema.d.ts
```

Полный прогон проверок (его же делает CI): сборка, линтеры, типы, тесты
бекенда и фронтенда, проверка актуальности сгенерированных контракта и SDK,
дымовая проверка API и браузерный сценарий Playwright на реальных серверах:

```bash
mise run check
```

Отдельно браузерный сценарий Playwright (поднимает реальные бекенд и Vite):

```bash
mise run e2e
```

## OpenCode в GitHub

Воркфлоу `.github/workflows/opencode.yml` запускает агента OpenCode по
командам в комментариях issues и pull request: он отвечает на вопросы,
делает резюме треда, может исправить код и открыть PR.

- **Событие**: `issue_comment` и `pull_request_review_comment`, только
  `types: [created]`. Прогон виден в Actions, ответ агент публикует
  комментарием в том же issue / PR; если менял код — ветка `opencode/issue*`
  с PR в `dev`.
- **Команды** (mentions заданы явно в экшене): `/opencode` и `/oc`. Текст
  после команды — задание агенту, например
  `/oc найди, почему бронирование бросает 409 в POST /api/bookings`.
  Комментарий из одной команды (`/oc`) — резюме треда.
  В комментарии к коду в Files-табе PR агент дополнительно получает файл и
  строки ревью.
- **Модель**: `opencode/deepseek-v4.1-flash-free` (провайдер `opencode`),
  ключ — `OPENCODE_API_KEY` в GitHub Secrets (Settings → Secrets and
  variables → Actions); мелкие задачи апстрим берёт из `small_model` в
  `opencode.json` — той же бесплатной моделью, чтобы заголовок сессии не
  уходил в платный тариф.
- **Права запуска**: только доверенные участники (автор комментария —
  OWNER/MEMBER/COLLABORATOR); команды ботов и комментарии на PR из
  недоверенных fork игнорируются — fork-код не выполняется с секретом.
- **Ограничения**: один прогон на issue/PR (concurrency), тайм-аут задания
  30 минут.
- **Авторизация**: стандартный режим — OIDC-обмен на токен GitHub App,
  нужен установленный [github.com/apps/opencode-agent](https://github.com/apps/opencode-agent);
  права джобы: `contents: read`, `pull-requests: read`, `issues: read`,
  `id-token: write`. Checkout без сохранения кредов (`persist-credentials: false`).
- **Решение по share**: сессии не публикуются — в апстриме фичу отключили,
  с экшена v1.19.5 input `share` deprecated и игнорируется.

Проверить работу: написать в существующем issue комментарий `/oc check` —
агент поставит реакцию 👀 на команду, ответит комментарием, а прогон
появится в Actions (workflow «opencode»).

### Автотриаж новых обращений (workflow opencode-triage)

Новое обращение проходит разбор и согласование без ручных команд, и в итоге
в GitHub Issues есть спецификация и тикеты для implement.

- **События**: `issues` (`opened`) — разбор нового обращения; `issue_comment`
  (`created`) — продолжение согласования, пока issue подписан `needs-info`
  (ответ репортёра или доверенного участника). Комментарии с `/oc` и
  `/opencode` идут в workflow «opencode» и автотриаж не запускают. Прогон
  не требует упоминания: инструкция задана в `prompt` воркфлоу — экшен
  требует его для события `issues`.
- **Пайплайн**: скилл `triage` — категория (`bug`/`enhancement`), проверки
  на уже реализованное и `.out-of-scope/`, `needs-info` с Triage Notes и
  вопросами (или `wontfix` с закрытием) → ответы в обсуждении → скилл
  `to-spec`: предложение швов, затем спека отдельным issue, связанным с
  исходным как sub-issue → скилл `to-tickets`: черновик вертикальных
  тикетов с зависимостями, затем публикация тикетов sub-issues исходного
  обращения с нативными блокировками GitHub → исходный issue снимает
  `needs-info` и получает `ready-for-agent`. Реализация тикетов — отдельный
  процесс через `/oc`, автотриаж код не трогает.
- **Фильтры**: боты не запускают разбор (иначе созданные агентом issue
  запускали бы новый триаж), продолжение — только по открытым issues с
  `needs-info` от репортёра или OWNER/MEMBER/COLLABORATOR.
- **Права**: джоба — `contents: read`, `issues: write`, `id-token: write`;
  `GH_TOKEN` проброшен в шаг агента, иначе `gh` не может ставить лейблы,
  писать комментарии и создавать sub-issues. Запрет менять файлы и открывать
  PR вшит в prompt. Пропущенные канонические лейблы (`needs-info`,
  `ready-for-human`) джоба создаёт сама перед прогоном.
- **Ограничения**: один прогон на issue (concurrency, без отмены), тайм-аут
  задания 20 минут. Разбор делается по тексту обращения, поэтому риск
  инструкций, подложенных в текст, принимается осознанно (как в «opencode»);
  токен ограничен issues.
- **Дисклеймер**: комментарии и issue, созданные автотриажем, начинаются
  со строки `> *This was generated by AI during triage.*`.

## Деплой

### Docker

```bash
docker build -t callcalendar .
docker run --rm -e PORT=8080 -p 8080:8080 callcalendar
```

Образ собирает React-фронтенд и кладёт его в `wwwroot`: UI и `/api` отдаются с
одного origin. Приложение слушает `0.0.0.0:$PORT` (без `PORT` — стандартный
порт ASP.NET Core, 8080), проверка живости — `GET /health`.

### Render

`render.yaml` создаёт web-сервис из `Dockerfile` с проверкой `/health`. Render
передаёт `PORT` автоматически, дополнительных переменных окружения не нужно.

1. Запушить изменения в GitHub.
2. Render Dashboard → **New** → **Blueprint** → выбрать репозиторий и применить
   `render.yaml`.
3. После первого деплоя Render выдаст публичный адрес.
4. Открыть https://callcalendar-615k.onrender.com/health — должно вернуться `ok`.

Работающий сервис: https://callcalendar-615k.onrender.com.

После мержа PR в `dev` деплой запускает workflow
`.github/workflows/render-deploy.yml`: он переключает ветку сервиса на `dev` и
через Render API запускает сборку образа. Для этого в секретах репозитория
должен быть `RENDER_API_KEY` (Settings → Secrets and variables → Actions).

### MCP-сервер Render

MCP подключён в `opencode.json` как remote-сервер `render` с адресом
`https://mcp.render.com/mcp`. Секретов в конфиге нет: авторизация идёт по OAuth,
токен хранится в профиле OpenCode.

1. Открыть OpenCode.
2. Выполнить `/mcps`, выбрать `render` → **Sign in**.
3. В браузере войти в Render и разрешить доступ.
4. Проверить `opencode mcp list` — сервер `render` в статусе connected.
5. Дальше деплой, логи и адрес сервиса доступны инструментами MCP.

Если OAuth недоступен (например, `api.render.com` закрыт сетью), используется
API-ключ Render. В конфигурации он подставляется из переменной окружения, а не
хранится в файле:

```jsonc
"render": {
  "type": "remote",
  "url": "https://mcp.render.com/mcp",
  "headers": { "Authorization": "Bearer {env:RENDER_API_KEY}" }
}
```

Ключ создаётся в Render Dashboard → **Account Settings** → **API Keys** и
передаётся только через `RENDER_API_KEY`.

### Ограничение хранения данных

Типы встреч и записи хранятся в памяти процесса, базы данных нет. Любой
рестарт, редеплой или засыпание бесплатного инстанса Render стирает все данные.
Публичная ссылка подходит для демонстрации, но не для реальных записей: для
сохранения данных нужна внешняя БД.

## Документация

- `CODING_STANDARDS.md` — стандарты кода и архитектуры
- `CONTRIBUTING.md` — окружение, коммиты, ветки и PR
- `REVIEW.md` — правила бронирования и формат замечаний для независимого авторевью
- `GLOSSARY.md` — словарь предметной области
- `docs/adr/` — принятые архитектурные решения

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
