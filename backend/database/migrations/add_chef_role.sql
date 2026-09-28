-- Миграция: Добавление роли 'chef' в таблицу family_members
-- Дата: 2024

-- Изменяем ENUM для поля role, добавляя 'chef'
ALTER TABLE family_members 
MODIFY COLUMN role ENUM('owner', 'chef', 'member') DEFAULT 'member';

-- Добавляем индекс для роли для ускорения запросов
ALTER TABLE family_members ADD INDEX idx_role (role);

-- Готово!
