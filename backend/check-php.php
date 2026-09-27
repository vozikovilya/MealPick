<?php
// Файл для проверки версии PHP и настроек сервера
// Загрузите этот файл на сервер и откройте в браузере

echo "<h1>Информация о сервере</h1>";
echo "<p><strong>Версия PHP:</strong> " . phpversion() . "</p>";
echo "<p><strong>Операционная система:</strong> " . php_uname() . "</p>";
echo "<p><strong>Сервер:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

echo "<h2>Расширения PHP</h2>";
echo "<ul>";
$extensions = get_loaded_extensions();
foreach ($extensions as $ext) {
    echo "<li>$ext</li>";
}
echo "</ul>";

echo "<h2>Проверка MySQL</h2>";
if (extension_loaded('mysqli')) {
    echo "<p style='color: green;'>✅ MySQLi расширение установлено</p>";
} else {
    echo "<p style='color: red;'>❌ MySQLi расширение НЕ установлено</p>";
}

if (extension_loaded('pdo_mysql')) {
    echo "<p style='color: green;'>✅ PDO MySQL расширение установлено</p>";
} else {
    echo "<p style='color: red;'>❌ PDO MySQL расширение НЕ установлено</p>";
}

echo "<h2>Рекомендации</h2>";
$php_version = phpversion();
if (version_compare($php_version, '8.0.0', '>=')) {
    echo "<p style='color: green;'>✅ PHP версия $php_version - отлично!</p>";
} elseif (version_compare($php_version, '7.4.0', '>=')) {
    echo "<p style='color: orange;'>⚠️ PHP версия $php_version - работает, но рекомендуется обновить до 8.x</p>";
} else {
    echo "<p style='color: red;'>❌ PHP версия $php_version - слишком старая, требуется минимум 7.4</p>";
}
?>
