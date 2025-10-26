# API

## Авторизация

Все защищённые запросы выполняются с JWT (RS256) в заголовке `Authorization: Bearer <token>`. JWKS публикуется по адресу `/auth/jwks.json` (будет добавлено в будущих релизах).

## Эндпоинты

### `POST /api/estimates`

Формирует подбор нормативов на основе текстового описания.

**Запрос**
```json
{
  "description": "Отделка квартиры 60 м2: стяжка пола, поклейка обоев, электрика",
  "method": "resource",
  "region": "Москва",
  "indexProfile": "Минстрой Q2 2024"
}
```

**Ответ**
```json
{
  "method": "resource",
  "region": "Москва",
  "indexProfile": "Минстрой Q2 2024",
  "dataset": { "id": "v0" },
  "candidates": [
    { "code": "ФЕР08-03-010-01", "title": "Устройство цементно-песчаной стяжки", "unit": "100 м2", "score": 2 }
  ]
}
```

### `GET /api/norms`

Поиск по нормативной базе.

Параметры: `q` — строка поиска, `limit` — ограничение.

### `GET /healthz`

Проверка готовности сервера.

## Планируемые методы

- `POST /api/calculate` — расчёт сметы по выбранным позициям.
- `POST /api/export/pdf` — генерация PDF форм.
- `POST /api/export/xml` — генерация XML (АРПС/CommerceML/КС-2/КС-3/КС-6а/ССР).
- `POST /api/onec/push` — интеграция с 1С.
- `POST /api/gis-zhkh/upload` — выгрузка смет в ГИС ЖКХ.
