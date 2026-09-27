/**
 * Утилита для отладки и проверки сохранения данных в localStorage
 * Используйте в консоли браузера: window.debugStorage()
 */

export const debugStorage = () => {
  const storageKey = 'meal-picker-storage';
  const data = localStorage.getItem(storageKey);
  
  if (!data) {
    console.log('❌ localStorage пуст');
    return;
  }
  
  try {
    const parsed = JSON.parse(data);
    console.log('✅ localStorage данные:');
    console.log('Версия:', parsed.version);
    console.log('Текущий пользователь:', parsed.state?.currentUserId);
    console.log('Семья:', parsed.state?.familyProfile);
    console.log('Пользователи:', parsed.state?.users?.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      familyId: u.familyId,
      isFamilyOwner: u.isFamilyOwner
    })));
    console.log('Заявки на вступление:', parsed.state?.familyJoinRequests);
    console.log('Уведомления:', parsed.state?.notifications?.length);
    console.log('Запросы:', parsed.state?.swipeRequests?.length);
    
    return parsed.state;
  } catch (error) {
    console.error('❌ Ошибка парсинга localStorage:', error);
  }
};

/**
 * Очистить localStorage и перезагрузить страницу
 */
export const clearStorage = () => {
  localStorage.removeItem('meal-picker-storage');
  console.log('✅ localStorage очищен');
  console.log('🔄 Перезагрузка страницы...');
  setTimeout(() => window.location.reload(), 1000);
};

/**
 * Проверить, сохраняется ли семья
 */
export const checkFamilyPreservation = () => {
  const storageKey = 'meal-picker-storage';
  const data = localStorage.getItem(storageKey);
  
  if (!data) {
    console.log('❌ localStorage пуст');
    return false;
  }
  
  try {
    const parsed = JSON.parse(data);
    const familyProfile = parsed.state?.familyProfile;
    
    if (!familyProfile) {
      console.log('❌ Семья не найдена в localStorage');
      return false;
    }
    
    console.log('✅ Семья найдена в localStorage:');
    console.log('ID:', familyProfile.id);
    console.log('Название:', familyProfile.name);
    console.log('Владелец:', familyProfile.ownerId);
    console.log('Участники:', familyProfile.memberIds);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки семьи:', error);
    return false;
  }
};

/**
 * Экспортируем в window для доступа из консоли
 */
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorage;
  (window as any).clearStorage = clearStorage;
  (window as any).checkFamilyPreservation = checkFamilyPreservation;
  
  console.log('🔧 Утилиты отладки загружены:');
  console.log('  - window.debugStorage() - показать все данные');
  console.log('  - window.clearStorage() - очистить localStorage');
  console.log('  - window.checkFamilyPreservation() - проверить сохранение семьи');
}
