import { Recipe } from './types';

const FALLBACK_IMAGE = 'image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f97316" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">🍽️</text></svg>';

/**
 * Безопасно получает URL первого изображения рецепта.
 * Поддерживает старое поле imageUrl и новое imageUrls.
 */
export function getRecipeImage(recipe: Recipe | undefined | null): string {
  if (!recipe) return FALLBACK_IMAGE;

  // Новое поле - массив изображений
  if (recipe.imageUrls && recipe.imageUrls.length > 0 && recipe.imageUrls[0]) {
    return recipe.imageUrls[0];
  }

  // Старое поле - одно изображение (для миграции)
  if ((recipe as any).imageUrl) {
    return (recipe as any).imageUrl;
  }

  return FALLBACK_IMAGE;
}

/**
 * Безопасно получает все изображения рецепта.
 */
export function getRecipeImages(recipe: Recipe | undefined | null): string[] {
  if (!recipe) return [];

  // Новое поле
  if (recipe.imageUrls && recipe.imageUrls.length > 0) {
    return recipe.imageUrls.filter(Boolean);
  }

  // Старое поле (миграция)
  if ((recipe as any).imageUrl) {
    return [(recipe as any).imageUrl];
  }

  return [];
}

export { FALLBACK_IMAGE };
