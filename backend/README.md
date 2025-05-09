# MrBets.ai Backend

FastAPI-based backend для MrBets.ai спортивной платформы прогнозирования.

## Архитектура

Бэкенд следует микросервисной архитектуре с использованием Redis для обмена сообщениями между компонентами:

1. **FastAPI App** - REST API для взаимодействия с фронтендом
2. **Worker** - Обрабатывает задачи из очереди Redis
3. **Jobs** - Периодические задачи, запускаемые по cron

## Стек технологий

- **FastAPI** - Web фреймворк
- **Redis** - Очереди и кэширование
- **Supabase** - База данных и хранилище
- **OpenAI API** - LLM для анализа и прогнозов
- **Pinecone** - Векторная база данных
- **Prometheus/Grafana** - Мониторинг

## Локальная разработка

### Установка зависимостей

```bash
pip install -r requirements.txt
```

### Запуск сервера разработки

```bash
uvicorn app.main:app --reload
```

### Запуск worker'а

```bash
python -m jobs.worker
```

### Сканирование матчей

```bash
python -m jobs.scan_fixtures
```

## Docker

Для запуска всей системы используйте Docker Compose:

```bash
docker-compose up -d
```

## API Endpoints

- `/` - Информация о API
- `/health` - Проверка состояния сервисов
- `/fixtures` - Информация о предстоящих матчах
- `/predictions` - Прогнозы AI

## Переменные окружения

Смотрите `.env.example` в корневой директории для списка необходимых переменных окружения. 