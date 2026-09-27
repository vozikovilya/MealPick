/**
 * Диагностика сохранения данных семьи
 * Используйте в консоли браузера для проверки
 */

export const diagnoseFamilyStorage = () => {
  console.group('🔍 Диагностика сохранения семьи');
  
  // 1. Проверяем localStorage
  const storageKey = 'meal-picker-storage';
  const rawData = localStorage.getItem(storageKey);
  
  if (!rawData) {
    console.error('❌ localStorage пуст');
    console.groupEnd();
    return;
  }
  
  try {
    const data = JSON.parse(rawData);
    console.log('✅ localStorage найден');
    console.log('Версия:', data.version);
    console.log('Полные данные:', data);
    
    // 2. Проверяем state
    if (!data.state) {
      console.error('❌ state отсутствует в localStorage');
      console.groupEnd();
      return;
    }
    
    console.log('✅ state найден');
    console.log('Текущий пользователь:', data.state.currentUserId);
    console.log('Семья:', data.state.familyProfile);
    console.log('Пользователи:', data.state.users);
    
    // 3. Проверяем семью
    if (!data.state.familyProfile) {
      console.warn('⚠️ familyProfile отсутствует или null');
    } else {
      console.log('✅ familyProfile найден');
      console.log('  - ID:', data.state.familyProfile.id);
      console.log('  - Название:', data.state.familyProfile.name);
      console.log('  - Владелец:', data.state.familyProfile.ownerId);
      console.log('  - Участники:', data.state.familyProfile.memberIds);
    }
    
    // 4. Проверяем пользователей
    if (data.state.users && data.state.users.length > 0) {
      console.log('✅ Пользователи найдены:', data.state.users.length);
      data.state.users.forEach((user: any) => {
        console.log(`  - ${user.name} (${user.email}): familyId=${user.familyId}, isFamilyOwner=${user.isFamilyOwner}`);
      });
    } else {
      console.error('❌ Пользователи отсутствуют');
    }
    
  } catch (error) {
    console.error('❌ Ошибка парсинга localStorage:', error);
  }
  
  console.groupEnd();
};

/**
 * Принудительное сохранение семьи
 */
export const forceSaveFamily = (familyData: any) => {
  const storageKey = 'meal-picker-storage';
  const rawData = localStorage.getItem(storageKey);
  
  if (!rawData) {
    console.error('❌ localStorage пуст');
    return;
  }
  
  try {
    const data = JSON.parse(rawData);
    data.state.familyProfile = familyData;
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('✅ Семья принудительно сохранена');
    diagnoseFamilyStorage();
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
  }
};

/**
 * Экспорт в window для доступа из консоли
 */
if (typeof window !== 'undefined') {
  (window as any).diagnoseFamilyStorage = diagnoseFamilyStorage;
  (window as any).forceSaveFamily = forceSaveFamily;
  
  console.log('🔧 Диагностика семьи загружена:');
  console.log('  - window.diagnoseFamilyStorage() - проверить сохранение');
  console.log('  - window.forceSaveFamily(data) - принудительно сохранить');
}
