# Инструкции по развертыванию на Vercel

## ✅ Что уже настроено

### 1. vercel.json
Файл конфигурации для корректной работы SPA:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Сборка проекта
- Build command: `npm run build`
- Output directory: `dist`
- Все пути к ассетам корректны

### 3. .gitignore
Исключены ненужные файлы:
- node_modules/
- dist/
- build/
- *.log

## 🚀 Пошаговая инструкция

### Вариант 1: Через веб-интерфейс Vercel

1. **Подготовка репозитория**
   ```bash
   # Убедитесь, что все изменения закоммичены
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Создание проекта на Vercel**
   - Перейдите на https://vercel.com/new
   - Нажмите "Import Git Repository"
   - Выберите ваш репозиторий
   - Vercel автоматически определит Vite проект

3. **Проверка настроек**
   - Framework Preset: **Vite** (должно определиться автоматически)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения (обычно 2-3 минуты)
   - Получите URL вида: `https://your-project.vercel.app`

### Вариант 2: Через Vercel CLI

```bash
# 1. Установите Vercel CLI глобально
npm i -g vercel

# 2. Войдите в аккаунт
vercel login

# 3. Перейдите в директорию проекта
cd meal-picker

# 4. Разверните проект (development)
vercel

# 5. Для production развертывания
vercel --prod
```

## 🔧 Дополнительные настройки

### Кастомный домен

1. Перейдите в настройки проекта на Vercel
2. Раздел "Domains"
3. Добавьте ваш домен
4. Настройте DNS записи согласно инструкциям Vercel

### Переменные окружения

Если в будущем понадобятся API ключи:

1. Перейдите в Settings → Environment Variables
2. Добавьте переменные для Production, Preview, Development
3. Используйте в коде через `import.meta.env.VITE_YOUR_VAR`

### Автоматические деплои

Vercel автоматически деплоит:
- При каждом push в main → Production
- При создании PR → Preview deployment
- При push в другие ветки → Preview deployment

## 📊 Проверка после деплоя

### 1. Проверьте основные функции
- [ ] Регистрация нового пользователя
- [ ] Вход в аккаунт
- [ ] Создание профиля семьи
- [ ] Добавление блюд
- [ ] Отправка запросов
- [ ] Свайп выбор блюд
- [ ] Уведомления

### 2. Проверьте производительность
```bash
# Локально
npm run build
npm run preview

# На Vercel используйте Lighthouse в Chrome DevTools
```

### 3. Проверьте мобильную версию
- Откройте сайт на мобильном устройстве
- Проверьте все функции
- Убедитесь, что свайпы работают корректно

## 🐛 Возможные проблемы и решения

### Проблема: Белый экран после деплоя
**Решение:** Проверьте консоль браузера на ошибки. Убедитесь, что все ассеты загружаются.

### Проблема: Не работают маршруты
**Решение:** Проверьте наличие `vercel.json` с настройками rewrites.

### Проблема: Не сохраняются данные
**Решение:** Приложение использует localStorage. Убедитесь, что браузер не блокирует storage.

### Проблема: Медленная загрузка
**Решение:** 
- Проверьте размер бандла: `npm run build` показывает размеры
- Рассмотрите code splitting для тяжелых компонентов
- Оптимизируйте изображения

## 📈 Мониторинг

Vercel предоставляет:
- Analytics (посещения, производительность)
- Logs (ошибки, запросы)
- Deployments (история деплоев)

Перейдите в Dashboard → ваш проект → Analytics/Logs

## 🔄 Обновление проекта

```bash
# Внесите изменения
git add .
git commit -m "Update description"
git push origin main

# Vercel автоматически задеплоит новую версию
```

## 💡 Полезные команды Vercel CLI

```bash
# Список всех деплоев
vercel ls

# Просмотр логов
vercel logs

# Удаление деплоя
vercel rm <deployment-url>

# Переключение между деплоями
vercel switch

# Инспекция деплоя
vercel inspect
```

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

## 🎯 Чек-лист перед продакшеном

- [ ] Все функции работают корректно
- [ ] Мобильная версия проверена
- [ ] Производительность оптимальна
- [ ] Ошибки в консоли отсутствуют
- [ ] vercel.json настроен
- [ ] README.md обновлен
- [ ] .gitignore корректен
- [ ] Все изменения закоммичены
- [ ] Production деплой успешен
- [ ] Кастомный домен настроен (если нужен)

---

**Готово!** Ваше приложение MealPick готово к работе на Vercel 🎉
