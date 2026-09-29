import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, Bell, Send, UtensilsCrossed, Plus, User, Users, 
  Edit2, Trash2, Crown, Copy, Check, X, ArrowLeft, LogOut,
  Mail, Lock, AtSign, Link, UserPlus, ChevronDown, Clock,
  CheckCheck, Inbox, Heart, XCircle, PartyPopper
} from 'lucide-react';
import { JoinRequestPopup } from './JoinRequestPopup';
import { JoinResponsePopup } from './JoinResponsePopup';
import { FamilyDeletedPopup } from './FamilyDeletedPopup';
import { LeaveFamilyPopup } from './LeaveFamilyPopup';
import { RemovedFromFamilyPopup } from './RemovedFromFamilyPopup';
import { JoinRejectedPopup } from './JoinRejectedPopup';
import { RequestSentModal } from './RequestSentModal';

export function AllComponentsDemo() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Все компоненты</h2>
      </div>

      {/* Секция: Блоки приложения */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">📱 Блоки приложения</h3>
        <p className="text-sm text-gray-600">Основные экраны приложения (статические превью)</p>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Блок "Меню" */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Блок "Меню"
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👨‍🍳</span>
                  <div>
                    <h5 className="text-lg font-bold text-gray-800">Моё меню</h5>
                    <p className="text-sm text-gray-500">12 блюд</p>
                  </div>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button className="p-2 rounded-lg bg-white shadow-sm text-orange-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Категории */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between mb-2 p-2 rounded-xl bg-white border border-gray-200">
                  <h6 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <span>🌅</span>
                    <span>Завтрак</span>
                    <span className="text-xs text-purple-400 font-normal">(3)</span>
                  </h6>
                  <div className="p-1 rounded-lg bg-purple-50">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Карточка блюда */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0 relative">
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg"></div>
                    </div>
                    <div className="flex-1 p-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-800 text-sm">Блинчики с творогом</h6>
                          <p className="text-xs text-gray-500 mt-0.5">Нежные блинчики с творожной начинкой</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>6 ингр.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Блок "Новое блюдо" */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Блок "Новое блюдо"
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="text-lg font-bold text-gray-800">Новое блюдо</h5>
              
              {/* Фото и видео */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h6 className="text-sm font-semibold text-gray-700">Фото и видео</h6>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-orange-200 rounded-xl text-sm text-orange-600 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Загрузить фото или видео
                </button>
              </div>

              {/* Название */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <h6 className="text-sm font-semibold text-gray-700">Название</h6>
                </div>
                <input
                  type="text"
                  placeholder="Например: Паста Карбонара"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                />
                <textarea
                  placeholder="Краткое описание блюда..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none"
                />
              </div>

              {/* Категория */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h6 className="text-sm font-semibold text-gray-700">Категория</h6>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="py-2.5 px-2 rounded-xl text-xs font-medium bg-orange-500 text-white shadow-md">
                    🌅 Завтрак
                  </button>
                  <button className="py-2.5 px-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-600">
                    ☀️ Обед
                  </button>
                  <button className="py-2.5 px-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-600">
                    🌙 Ужин
                  </button>
                </div>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg">
                Сохранить блюдо
              </button>
            </div>
          </div>

          {/* Блок "Спросить" */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" />
              Блок "Спросить"
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="text-lg font-bold text-gray-800">Спросить</h5>
              
              {/* Кому отправить */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <h6 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Кому отправить?
                </h6>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-3 px-3 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-center gap-2">
                    <span className="text-lg">👨‍👩‍👧‍👦</span>
                    <span>Всей семье</span>
                  </button>
                  <button className="py-3 px-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 flex items-center justify-center gap-2">
                    <span className="text-lg">👥</span>
                    <span>Выбрать участников</span>
                  </button>
                </div>
              </div>

              {/* Что отправить */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <h6 className="text-sm font-semibold text-gray-700">Что отправить?</h6>
                <div className="grid grid-cols-3 gap-2">
                  <button className="py-3 px-2 rounded-xl text-xs font-medium bg-orange-500 text-white shadow-md flex flex-col items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Категории</span>
                  </button>
                  <button className="py-3 px-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 flex flex-col items-center gap-1.5">
                    <Check className="w-5 h-5" />
                    <span>Блюда</span>
                  </button>
                  <button className="py-3 px-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 flex flex-col items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Доставка</span>
                  </button>
                </div>
              </div>

              {/* Сообщение */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Добавьте милое сообщение
                </label>
                <textarea
                  placeholder="Напишите что-нибудь приятное..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  <button className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">
                    Люблю тебя! ❤️
                  </button>
                  <button className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">
                    Что будем кушать?
                  </button>
                </div>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Отправить запрос
              </button>
            </div>
          </div>

          {/* Блок "Семья" */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Блок "Семья"
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="text-lg font-bold text-gray-800">Семья</h5>
              
              {/* Карточка семьи */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
                  <h6 className="text-lg font-bold text-gray-800">Семья Ивановых</h6>
                  <p className="text-sm text-gray-500 mt-1">Наша дружная семья</p>
                </div>
                <button className="w-full py-2.5 bg-orange-50 text-orange-600 font-medium rounded-xl flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Редактировать семью
                </button>
              </div>

              {/* Заявки на вступление */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 space-y-3">
                <h6 className="font-semibold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-orange-500" />
                  Заявки на вступление (2)
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </h6>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <span className="text-2xl">👨</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Иван Петров</p>
                      <p className="text-xs text-gray-500">ivan@example.com</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg">
                        Принять
                      </button>
                      <button className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg">
                        Отклонить
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Участники */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <h6 className="text-sm font-semibold text-gray-700">Участники (3)</h6>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <span className="text-2xl">👨‍🍳</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">Илья</p>
                        <span className="text-xs text-orange-600 font-medium">(Вы)</span>
                      </div>
                      <p className="text-xs text-gray-500">ilya@example.com</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          <Crown className="w-3 h-3" />
                          <span>Глава семьи</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                    <span className="text-2xl">👩</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Мария</p>
                      <p className="text-xs text-gray-500">maria@example.com</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <span>👨‍🍳</span>
                          <span>Поварушка</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      Действия
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ссылка для приглашения */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <label className="text-sm font-medium text-gray-700">Ссылка для приглашения</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://mealspick.app/join/abc123..."
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
                  />
                  <button className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Копировать
                  </button>
                </div>
                <button className="w-full py-3 bg-purple-50 text-purple-600 font-medium rounded-xl flex items-center justify-center gap-2">
                  📤 Поделиться в соцсетях
                </button>
              </div>

              {/* Удалить семью */}
              <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-4">
                <button className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Удалить профиль семьи
                </button>
              </div>
            </div>
          </div>

          {/* Блок "Я" */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-500" />
              Блок "Я"
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="text-lg font-bold text-gray-800">Я</h5>
              
              {/* Карточка профиля */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-5xl shadow-sm">
                    👨‍🍳
                  </div>
                  <div className="flex-1">
                    <h6 className="text-xl font-bold text-gray-800 mb-1">Илья</h6>
                    <p className="text-sm text-gray-500 mb-2">@ilya</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Люблю готовить и делиться рецептами с семьёй</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-orange-50 text-orange-600 font-medium rounded-xl mt-4 flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Редактировать
                </button>
              </div>

              {/* Данные для входа */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <h6 className="text-lg font-semibold text-gray-800">Данные для входа</h6>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                      type="email"
                      value="ilya@example.com"
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <AtSign className="w-4 h-4" /> Логин
                    </label>
                    <input
                      type="text"
                      value="ilya"
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </div>
                  <button className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Обновить данные входа
                  </button>
                </div>
              </div>

              {/* Удалить аккаунт */}
              <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-4">
                <button className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Удалить аккаунт
                </button>
              </div>

              {/* Выйти из аккаунта */}
              <button className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" />
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Секция: Модальные окна */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">🪟 Модальные окна</h3>
        <p className="text-sm text-gray-600">Все попапы и модальные окна приложения</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setActiveModal('join-request')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-purple-800 mb-1">Заявка на вступление</h4>
            <p className="text-xs text-purple-600">Для главы семьи</p>
          </button>

          <button
            onClick={() => setActiveModal('join-response-accepted')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-green-800 mb-1">Заявка принята</h4>
            <p className="text-xs text-green-600">Для пользователя</p>
          </button>

          <button
            onClick={() => setActiveModal('join-response-rejected')}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-gray-800 mb-1">Заявка отклонена</h4>
            <p className="text-xs text-gray-600">Для пользователя</p>
          </button>

          <button
            onClick={() => setActiveModal('family-deleted')}
            className="p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-red-800 mb-1">Семья удалена</h4>
            <p className="text-xs text-red-600">Для участников</p>
          </button>

          <button
            onClick={() => setActiveModal('leave-family')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-orange-800 mb-1">Вы вышли из семьи</h4>
            <p className="text-xs text-orange-600">Для участника</p>
          </button>

          <button
            onClick={() => setActiveModal('removed-from-family')}
            className="p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-red-800 mb-1">Вас удалили из семьи</h4>
            <p className="text-xs text-red-600">Для участника</p>
          </button>

          <button
            onClick={() => setActiveModal('join-rejected')}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-gray-800 mb-1">Заявка отклонена</h4>
            <p className="text-xs text-gray-600">Утешительный попап</p>
          </button>

          <button
            onClick={() => setActiveModal('request-sent')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
          >
            <h4 className="font-semibold text-blue-800 mb-1">Запрос отправлен</h4>
            <p className="text-xs text-blue-600">Подтверждение отправки</p>
          </button>
        </div>
      </div>

      {/* Модальные окна */}
      <JoinRequestPopup
        isOpen={activeModal === 'join-request'}
        onClose={() => setActiveModal(null)}
        onAccept={() => setActiveModal(null)}
        onReject={() => setActiveModal(null)}
        onLater={() => setActiveModal(null)}
        userName="Иван Петров"
        userEmail="ivan@example.com"
        userAvatar="👨"
      />

      <JoinResponsePopup
        isOpen={activeModal === 'join-response-accepted'}
        onClose={() => setActiveModal(null)}
        onNavigate={() => setActiveModal(null)}
        accepted={true}
        familyName="Семья Ивановых"
      />

      <JoinResponsePopup
        isOpen={activeModal === 'join-response-rejected'}
        onClose={() => setActiveModal(null)}
        onNavigate={() => setActiveModal(null)}
        accepted={false}
        familyName="Семья Ивановых"
      />

      <FamilyDeletedPopup
        isOpen={activeModal === 'family-deleted'}
        onClose={() => setActiveModal(null)}
        familyName="Семья Ивановых"
      />

      <LeaveFamilyPopup
        isOpen={activeModal === 'leave-family'}
        onClose={() => setActiveModal(null)}
        familyName="Семья Ивановых"
      />

      <RemovedFromFamilyPopup
        isOpen={activeModal === 'removed-from-family'}
        onClose={() => setActiveModal(null)}
        familyName="Семья Ивановых"
      />

      <JoinRejectedPopup
        isOpen={activeModal === 'join-rejected'}
        onClose={() => setActiveModal(null)}
        familyName="Семья Ивановых"
      />

      <RequestSentModal
        isOpen={activeModal === 'request-sent'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
