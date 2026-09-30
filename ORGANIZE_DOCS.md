# 📁 Инструкция по организации документации

## ✅ Что сделано

1. **Создана папка `docs/`** для всей документации
2. **Создан `docs/README.md`** с описанием структуры
3. **Создан скрипт `move_docs.sh`** для автоматического перемещения файлов

## 🚀 Как переместить файлы

### Вариант 1: Автоматический (рекомендуется)

Выполните скрипт:

```bash
chmod +x move_docs.sh
./move_docs.sh
```

### Вариант 2: Ручной

Переместите все `.md` файлы из корня в папку `docs/`:

```bash
# Linux/Mac
mv *.md docs/ 2>/dev/null || true

# Windows (PowerShell)
Move-Item -Path *.md -Destination docs\ -ErrorAction SilentlyContinue
```

### Вариант 3: Через файловый менеджер

1. Откройте файловый менеджер
2. Выделите все `.md` файлы в корне проекта (кроме `README.md`)
3. Переместите их в папку `docs/`

## 📋 Какие файлы переместить

Переместите все файлы из этого списка:

- ✅ `AUDIT_REPORT.md`
- ✅ `BACKEND_AUDIT_AND_OPTIMIZATION.md`
- ✅ `BACKEND_READY.md`
- ✅ `BOTTOM_NAV_UPDATE.md`
- ✅ `BUGFIX_JSON_PARSE.md`
- ✅ `BUGFIX_REACT_310.md`
- ✅ `BUGFIX_REACT_310_COMPLETE.md`
- ✅ `BUGFIX_REACT_310_FINAL.md`
- ✅ `BUGFIX_REMOVAL_AND_STATE.md`
- ✅ `COUNTER_ANIMATION.md`
- ✅ `DATA_PRESERVATION_ANALYSIS.md`
- ✅ `DEBUG_FAMILY_STORAGE.md`
- ✅ `DEPLOYMENT_COUNTER_ANIMATION.md`
- ✅ `DEPLOYMENT_FINAL.md`
- ✅ `DEPLOYMENT_INSTRUCTIONS.md`
- ✅ `DEPLOYMENT_NOTIFICATION_FEATURES.md`
- ✅ `DEPLOYMENT_PROFILE_NOTIFICATIONS.md`
- ✅ `DEPLOYMENT_REACT_FIX.md`
- ✅ `DEPLOYMENT_REALTIME_COUNTER.md`
- ✅ `DEPLOYMENT_REORGANIZATION.md`
- ✅ `DEPLOYMENT_UI_COMPLETE.md`
- ✅ `DEPLOYMENT_UI_LIBRARY.md`
- ✅ `DEPLOYMENT_V7.md`
- ✅ `DIAGNOSE_NOW.md`
- ✅ `FAMILY_IMPROVEMENTS_V3.md`
- ✅ `FAMILY_LOGIC_COMPLETE.md`
- ✅ `FAMILY_PRESERVATION_FIX.md`
- ✅ `FAMILY_PROFILE_FIXES.md`
- ✅ `FAMILY_PROFILE_IMPROVEMENTS.md`
- ✅ `FINAL_BACKEND_AUDIT.md`
- ✅ `FINAL_DEPLOYMENT.md`
- ✅ `FINAL_DEPLOYMENT_UI.md`
- ✅ `FINAL_REPORT.md`
- ✅ `IMPLEMENTATION_PLAN.md`
- ✅ `INTEGRATION_GUIDE.md`
- ✅ `NEW_FEATURES_V7.md`
- ✅ `NOTIFICATION_COUNTER_AND_AUTO_READ.md`
- ✅ `PROFILE_NOTIFICATIONS.md`
- ✅ `PROJECT_RULES.md`
- ✅ `QUICK_FIX_SUMMARY.md`
- ✅ `QUICK_START.md`
- ✅ `QUICK_START_BACKEND.md`
- ✅ `REALTIME_COUNTER_UPDATE.md`
- ✅ `REORGANIZATION_FINAL.md`
- ✅ `REORGANIZATION_SUMMARY.md`
- ✅ `SEND_REQUEST_DEPLOYMENT.md`
- ✅ `SEND_REQUEST_DEPLOYMENT_V2.md`
- ✅ `SEND_REQUEST_FINAL_SUMMARY.md`
- ✅ `SEND_REQUEST_IMPROVEMENTS_V2.md`
- ✅ `SEND_REQUEST_LOGIC_COMPLETE.md`
- ✅ `TESTING_GUIDE.md`
- ✅ `UI_INTEGRATION_GUIDE.md`
- ✅ `UI_LIBRARY_COMPLETE.md`
- ✅ `UI_LIBRARY_FINAL_REPORT.md`
- ✅ `UI_LIBRARY_GUIDE.md`
- ✅ `USER_DATA_ISOLATION_FIX.md`
- ✅ `VERCEL_DEPLOYMENT.md`

**НЕ перемещайте:**
- ❌ `README.md` (оставьте в корне - это стандарт)
- ❌ Файлы из `node_modules/`
- ❌ Файлы из `backend/` (у них своя структура)

## 📁 Итоговая структура

После перемещения структура должна быть такой:

```
meal-picker/
├── README.md                    ← остаётся в корне
├── docs/                        ← вся документация здесь
│   ├── README.md               ← описание структуры
│   ├── AUDIT_REPORT.md
│   ├── BACKEND_AUDIT_AND_OPTIMIZATION.md
│   ├── ... (все остальные .md файлы)
│   └── VERCEL_DEPLOYMENT.md
├── src/
│   ├── components/
│   ├── services/
│   └── ...
├── backend/
│   ├── README.md               ← остаётся в backend/
│   ├── DEPLOYMENT.md           ← остаётся в backend/
│   └── ...
└── ...
```

## ✅ Проверка

После перемещения проверьте:

1. ✅ Все `.md` файлы (кроме `README.md`) находятся в `docs/`
2. ✅ `README.md` остался в корне проекта
3. ✅ `backend/README.md` и `backend/DEPLOYMENT.md` остались в `backend/`
4. ✅ `docs/README.md` создан и содержит описание структуры

## 🎯 Преимущества

- ✅ Чистая структура проекта
- ✅ Вся документация в одном месте
- ✅ Легко найти нужный файл
- ✅ Корневая директория не захламлена
- ✅ Стандартная практика для проектов

---

**После перемещения файлов структура проекта станет чистой и организованной!** 🎉
