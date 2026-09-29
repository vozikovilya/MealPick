#!/bin/bash

# Скрипт для перемещения документации в папку docs/

echo "🚀 Начинаем перемещение документации..."

# Создаём папку docs если её нет
mkdir -p docs

# Список файлов для перемещения (без node_modules и backend)
files=(
  "DEPLOYMENT_FINAL.md"
  "REORGANIZATION_FINAL.md"
  "DEPLOYMENT_REORGANIZATION.md"
  "REORGANIZATION_SUMMARY.md"
  "DEPLOYMENT_PROFILE_NOTIFICATIONS.md"
  "PROFILE_NOTIFICATIONS.md"
  "FINAL_DEPLOYMENT_UI.md"
  "UI_INTEGRATION_GUIDE.md"
  "DEPLOYMENT_UI_COMPLETE.md"
  "UI_LIBRARY_COMPLETE.md"
  "UI_LIBRARY_FINAL_REPORT.md"
  "DEPLOYMENT_UI_LIBRARY.md"
  "UI_LIBRARY_GUIDE.md"
  "PROJECT_RULES.md"
  "DEPLOYMENT_COUNTER_ANIMATION.md"
  "COUNTER_ANIMATION.md"
  "DEPLOYMENT_REALTIME_COUNTER.md"
  "REALTIME_COUNTER_UPDATE.md"
  "DEPLOYMENT_NOTIFICATION_FEATURES.md"
  "NOTIFICATION_COUNTER_AND_AUTO_READ.md"
  "FINAL_DEPLOYMENT.md"
  "BUGFIX_REACT_310_COMPLETE.md"
  "DEPLOYMENT_REACT_FIX.md"
  "BUGFIX_REACT_310_FINAL.md"
  "BUGFIX_REACT_310.md"
  "DEPLOYMENT_V7.md"
  "NEW_FEATURES_V7.md"
  "BUGFIX_JSON_PARSE.md"
  "BUGFIX_REMOVAL_AND_STATE.md"
  "SEND_REQUEST_FINAL_SUMMARY.md"
  "SEND_REQUEST_DEPLOYMENT_V2.md"
  "SEND_REQUEST_IMPROVEMENTS_V2.md"
  "SEND_REQUEST_DEPLOYMENT.md"
  "SEND_REQUEST_LOGIC_COMPLETE.md"
  "FAMILY_LOGIC_COMPLETE.md"
  "DEPLOYMENT_INSTRUCTIONS.md"
  "FINAL_BACKEND_AUDIT.md"
  "BACKEND_AUDIT_AND_OPTIMIZATION.md"
  "FAMILY_IMPROVEMENTS_V3.md"
  "FAMILY_PROFILE_IMPROVEMENTS.md"
  "FAMILY_PROFILE_FIXES.md"
  "INTEGRATION_GUIDE.md"
  "QUICK_START_BACKEND.md"
  "BACKEND_READY.md"
  "BOTTOM_NAV_UPDATE.md"
  "DIAGNOSE_NOW.md"
  "DEBUG_FAMILY_STORAGE.md"
  "QUICK_FIX_SUMMARY.md"
  "FINAL_REPORT.md"
  "TESTING_GUIDE.md"
  "DATA_PRESERVATION_ANALYSIS.md"
  "FAMILY_PRESERVATION_FIX.md"
  "USER_DATA_ISOLATION_FIX.md"
  "QUICK_START.md"
  "VERCEL_DEPLOYMENT.md"
  "IMPLEMENTATION_PLAN.md"
  "AUDIT_REPORT.md"
)

# Перемещаем файлы
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/
    echo "✅ Перемещён: $file"
  else
    echo "⚠️  Не найден: $file"
  fi
done

echo ""
echo "🎉 Готово! Все файлы перемещены в папку docs/"
echo ""
echo "📁 Структура:"
echo "   docs/"
echo "   ├── README.md (создан вручную)"
ls -1 docs/*.md | wc -l | xargs echo "   └──" "файлов документации"
