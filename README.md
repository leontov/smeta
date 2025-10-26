# Смета №1 — монорепозиторий

Монорепозиторий содержит Flutter-клиент и Node.js-бэкенд для создания смет по текстовому описанию с соблюдением нормативов РФ.

## Структура

```
apps/
  mobile/   # Flutter-приложение (Android/iOS)
  backend/  # Node.js/TypeScript API + Genkit/Gemini пайплайн

datasets/
  v0/       # Демонстрационный набор нормативов и индексов

docs/       # Архитектура, API, интеграции
```

## Быстрый старт

### Мобильное приложение (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

Приложение содержит:

- главный экран с сохранёнными черновиками;
- мастер составления сметы: ввод описания, выбор метода (ресурсный/базисно-индексный), подбор норм;
- локальное хранилище SQLite с seed-базой норм;
- экран деталей с обзором подобранных норм и возможностью удаления черновика.

### Бэкенд (Node.js + TypeScript)

```bash
cd apps/backend
npm install
npm run dev
```

Эндпоинты:

- `POST /api/estimates` — подбор норм по тексту (гибридное ранжирование).
- `GET /api/norms?q=` — поиск по локальной базе нормативов.
- `GET /healthz` — проверка готовности.

## Наборы данных

В `datasets/v0/` находятся примеры файлов `meta.json`, `norms.jsonl`, `indices.json`, `coeff_matrix.json`, `synonyms.json`. Формат описан в [docs/DATASETS.md](docs/DATASETS.md).

## Документация

- [ARCHITECTURE](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [COMMERCE-1C](docs/COMMERCE-1C.md)
- [SECURITY](docs/SECURITY.md)
- [STORE_PUBLISHING](docs/STORE_PUBLISHING.md)

## Следующие шаги

1. Добавить оффлайн OCR/ASR и подключение к Genkit/Gemini для уточнения норм.
2. Реализовать расчётный движок (ресурсный и базисно-индексный методы) и генерацию документов PDF/XLSX/XML.
3. Внедрить JWT/RBAC, аудит и обмен с 1С/ГИС ЖКХ.
4. Расширить датасеты (ФСНБ, индексы по регионам) и добавить инструменты импорта.
