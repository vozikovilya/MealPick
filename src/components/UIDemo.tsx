import { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  TextArea,
  Badge, 
  Avatar, 
  Modal, 
  Alert, 
  Divider, 
  Spinner, 
  EmptyState,
  SectionHeader,
  Tooltip,
  Progress,
  Tag,
  Checkbox,
  colors,
  spacing,
  borderRadius,
  shadows
} from '../ui';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Bell, 
  Star,
  Search,
  User,
  Inbox,
  ChefHat
} from 'lucide-react';

export function UIDemo() {
  const [showModal, setShowModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progressValue, setProgressValue] = useState(65);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            MealPick UI Library
          </h1>
          <p className="text-gray-600">Демонстрация всех компонентов UI библиотеки</p>
        </div>

        {/* Buttons Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Plus className="w-4 h-4 text-orange-600" />}
            title="Button"
            subtitle="Кнопки с различными вариантами стилей"
          />
          <Divider />
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Варианты:</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Размеры:</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">С иконками:</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                  Добавить
                </Button>
                <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} iconPosition="right">
                  Удалить
                </Button>
                <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />}>
                  Редактировать
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Состояния:</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>Загрузка...</Button>
                <Button variant="primary" disabled>Отключена</Button>
                <Button variant="primary" fullWidth>Полная ширина</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Edit2 className="w-4 h-4 text-orange-600" />}
            title="Input & TextArea"
            subtitle="Поля ввода с валидацией"
          />
          <Divider />
          
          <div className="space-y-4">
            <Input 
              label="Обычное поле"
              placeholder="Введите текст..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Input 
              label="Поле с иконкой"
              icon={<Search className="w-5 h-5" />}
              placeholder="Поиск..."
            />

            <Input 
              label="Поле с ошибкой"
              error="Это поле обязательно"
              placeholder="Введите данные"
            />

            <Input 
              label="Заполненное поле"
              variant="filled"
              placeholder="Заполненное поле"
            />

            <TextArea 
              label="Многострочное поле"
              placeholder="Введите описание..."
              rows={3}
            />
          </div>
        </Card>

        {/* Badges Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Star className="w-4 h-4 text-orange-600" />}
            title="Badge"
            subtitle="Бейджи для отображения статусов"
          />
          <Divider />
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Варианты:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Размеры:</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Анимированный:</p>
              <Badge variant="danger" animated>
                3
              </Badge>
            </div>
          </div>
        </Card>

        {/* Avatars Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<User className="w-4 h-4 text-orange-600" />}
            title="Avatar"
            subtitle="Аватары пользователей"
          />
          <Divider />
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Размеры:</p>
              <div className="flex items-center gap-3">
                <Avatar emoji="👨‍🍳" size="xs" />
                <Avatar emoji="👩‍🍳" size="sm" />
                <Avatar emoji="🧑‍🍳" size="md" />
                <Avatar emoji="👨" size="lg" />
                <Avatar emoji="👩" size="xl" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Со статусами:</p>
              <div className="flex items-center gap-3">
                <Avatar emoji="👨‍🍳" size="md" status="online" />
                <Avatar emoji="👩‍🍳" size="md" status="offline" />
                <Avatar emoji="🧑‍🍳" size="md" status="busy" />
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Bell className="w-4 h-4 text-orange-600" />}
            title="Alert"
            subtitle="Предупреждения для важных сообщений"
          />
          <Divider />
          
          <div className="space-y-3">
            <Alert variant="info" title="Информация">
              Это информационное сообщение
            </Alert>

            <Alert variant="success" title="Успех!">
              Операция выполнена успешно
            </Alert>

            <Alert variant="warning" title="Внимание!">
              Пожалуйста, проверьте данные
            </Alert>

            <Alert variant="error" title="Ошибка!">
              Произошла ошибка при выполнении
            </Alert>
          </div>
        </Card>

        {/* Progress Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Check className="w-4 h-4 text-orange-600" />}
            title="Progress"
            subtitle="Прогресс-бары"
          />
          <Divider />
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Варианты:</p>
              <div className="space-y-3">
                <Progress value={progressValue} variant="default" />
                <Progress value={progressValue} variant="success" />
                <Progress value={progressValue} variant="warning" />
                <Progress value={progressValue} variant="danger" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">С лейблом:</p>
              <Progress value={progressValue} showLabel />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Интерактивный:</p>
              <Progress value={progressValue} showLabel />
              <input
                type="range"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Spinner Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Spinner className="w-4 h-4 text-orange-600" />}
            title="Spinner"
            subtitle="Индикаторы загрузки"
          />
          <Divider />
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Spinner size="sm" />
              <p className="text-xs text-gray-600 mt-2">Small</p>
            </div>
            <div className="text-center">
              <Spinner size="md" />
              <p className="text-xs text-gray-600 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-xs text-gray-600 mt-2">Large</p>
            </div>
          </div>
        </Card>

        {/* Empty State Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Inbox className="w-4 h-4 text-orange-600" />}
            title="EmptyState"
            subtitle="Пустые состояния"
          />
          <Divider />
          
          <EmptyState
            icon={<Inbox className="w-10 h-10 text-gray-300" />}
            title="Нет уведомлений"
            description="Когда вам придут запросы, они появятся здесь"
            action={
              <Button variant="primary">
                Создать первое
              </Button>
            }
          />
        </Card>

        {/* Modal Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Edit2 className="w-4 h-4 text-orange-600" />}
            title="Modal"
            subtitle="Модальные окна"
          />
          <Divider />
          
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Открыть модальное окно
          </Button>

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Пример модального окна"
          >
            <p className="text-gray-600 mb-4">
              Это пример модального окна с использованием компонента Modal из UI библиотеки.
            </p>
            <Alert variant="info">
              Модальные окна поддерживают различные размеры и настройки
            </Alert>
            <div className="flex gap-3 mt-4">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Отмена
              </Button>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Подтвердить
              </Button>
            </div>
          </Modal>
        </Card>

        {/* Design Tokens Section */}
        <Card variant="elevated" padding="lg">
          <SectionHeader 
            icon={<Star className="w-4 h-4 text-orange-600" />}
            title="Design Tokens"
            subtitle="Токены дизайн-системы"
          />
          <Divider />
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Цвета:</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.primary[500] }}></div>
                  <p className="text-xs">Primary</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.secondary[500] }}></div>
                  <p className="text-xs">Secondary</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.success[500] }}></div>
                  <p className="text-xs">Success</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.danger[500] }}></div>
                  <p className="text-xs">Danger</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.warning[500] }}></div>
                  <p className="text-xs">Warning</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-12 rounded-lg mb-1" style={{ backgroundColor: colors.info[500] }}></div>
                  <p className="text-xs">Info</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Скругления:</p>
              <div className="flex flex-wrap gap-3">
                {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map(radius => (
                  <div key={radius} className="text-center">
                    <div 
                      className="w-16 h-16 bg-orange-200 mb-1" 
                      style={{ 
                        borderRadius: borderRadius[radius as keyof typeof borderRadius]
                      }}
                    ></div>
                    <p className="text-xs">{radius}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Тени:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['sm', 'md', 'lg', 'xl', '2xl'].map(shadow => (
                  <div key={shadow} className="text-center">
                    <div 
                      className="w-full h-20 bg-white rounded-lg mb-1" 
                      style={{ 
                        boxShadow: shadows[shadow as keyof typeof shadows]
                      }}
                    ></div>
                    <p className="text-xs">{shadow}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            MealPick UI Library v1.0 • Создано с ❤️ для проекта MealPick
          </p>
        </div>

      </div>
    </div>
  );
}
