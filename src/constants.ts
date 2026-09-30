/**
 * Общие константы приложения
 */

// Типы блюд
export const MEAL_TYPES = [
  { id: 'breakfast', name: 'Завтрак', emoji: '🌅' },
  { id: 'lunch', name: 'Обед', emoji: '☀️' },
  { id: 'dinner', name: 'Ужин', emoji: '🌙' },
  { id: 'sides', name: 'Гарниры', emoji: '🥔' },
  { id: 'desserts', name: 'Десерты', emoji: '🍰' },
  { id: 'drinks', name: 'Напитки', emoji: '🥤' },
  { id: 'sauces', name: 'Соусы', emoji: '🥫' },
];

// Опции доставки
export const DELIVERY_OPTIONS = [
  { id: 'd1', name: 'Суши', emoji: '🍣', description: 'Японская кухня' },
  { id: 'd2', name: 'Пицца', emoji: '🍕', description: 'Итальянская кухня' },
  { id: 'd3', name: 'Бургеры', emoji: '🍔', description: 'Фастфуд' },
  { id: 'd4', name: 'Вок', emoji: '🍜', description: 'Азиатская кухня' },
  { id: 'd5', name: 'Шаурма', emoji: '🌯', description: 'Восточная кухня' },
  { id: 'd6', name: 'Салаты', emoji: '🥗', description: 'Здоровая еда' },
];

// Милые сообщения для отправки запросов
export const CUTE_MESSAGES = [
  'Люблю тебя! ❤️',
  'Что будем кушать?',
  'Голодный(ая) 😋',
  'Выбирай скорее!',
  'Удиви меня!',
  'Давай что-нибудь вкусненькое?',
  'Я доверяю твоему вкусу!',
  'Что-то особенное сегодня?',
];
