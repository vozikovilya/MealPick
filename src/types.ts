export interface Ingredient {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
}

export interface CookingStep {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  ingredients: Ingredient[];
  mealType: string;
  cookingSteps?: CookingStep[];
  ownerId: string;
  createdAt: number;
}

export interface MealTypeOption {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  recipes: Recipe[];
}

export interface SwipeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  recipeIds: string[];
  status: 'pending' | 'completed';
  createdAt: number;
  selectedRecipeIds?: string[];
  mode?: 'category' | 'select';
  category?: string;
}

export interface Notification {
  id: string;
  type: 'swipe_request' | 'swipe_response';
  fromUserId: string;
  message: string;
  requestId?: string;
  read: boolean;
  createdAt: number;
}
