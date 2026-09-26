export interface Ingredient {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
}

export interface CookingStep {
  id: string;
  title: string;
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
  pairedRecipeIds?: string[]; // блюда из подборок (гарниры и т.д.)
  ownerId: string;
  createdAt: number;
}

export interface MealTypeOption {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  isCollection?: boolean; // для подборок: гарниры, десерты и т.д.
}

export interface DeliveryOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  avatar: string;
  description?: string;
  recipes: Recipe[];
  familyId?: string;
  isFamilyOwner?: boolean;
}

export interface FamilyProfile {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  inviteLink: string;
  createdAt: number;
}

export interface SwipeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  recipeIds: string[];
  status: 'pending' | 'completed';
  createdAt: number;
  selectedRecipeIds?: string[];
  mode?: 'category' | 'select' | 'delivery';
  category?: string;
  message?: string; // милое сообщение
  deliveryIds?: string[]; // выбранные доставки
}

export interface Notification {
  id: string;
  type: 'swipe_request' | 'swipe_response';
  fromUserId: string;
  message: string;
  senderMessage?: string; // милое сообщение от отправителя
  requestId?: string;
  read: boolean;
  createdAt: number;
}
