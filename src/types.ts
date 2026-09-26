export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner';
  ownerId: string;
  createdAt: number;
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
