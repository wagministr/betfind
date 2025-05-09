# MrBets.ai Frontend

Next.js 14 фронтенд для MrBets.ai спортивной платформы прогнозирования.

## Стек технологий

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Shadcn UI** - UI компоненты
- **Supabase Auth** - Аутентификация пользователей

## Локальная разработка

### Установка зависимостей

```bash
npm install
```

### Запуск сервера разработки

```bash
npm run dev
```

### Сборка для продакшна

```bash
npm run build
```

## Ключевые страницы

- `/` - Главная страница
- `/ai` - Прогнозы AI для предстоящих матчей
- `/ai/[id]` - Детальный прогноз для конкретного матча

## Компоненты

- **MatchCard** - Карточка матча
- **MatchScroller** - Горизонтальный скроллер матчей
- **PredictionDisplay** - Отображение прогноза AI
- **ValueBetCard** - Отображение ценных ставок

## Переменные окружения

Необходимые переменные окружения (берутся из общего корневого `.env`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Docker

Для запуска с использованием Docker:

```bash
docker build -t mrbets-frontend .
docker run -p 3000:3000 mrbets-frontend
```

Для разработки рекомендуется использовать `docker-compose` из корневой директории проекта.

## Деплой

Фронтенд развертывается на Vercel. При пуше в ветку `main` автоматически запускается деплой. 