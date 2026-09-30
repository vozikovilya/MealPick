/**
 * Доменные типы приложения MealPick (общие для API-клиента и компонентов).
 */

// ==================== AUTH / USER ====================

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  avatar: string;
  description: string | null;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
  avatar?: string;
  description?: string;
}

export interface LoginData {
  login: string;
  password: string;
}

// ==================== FAMILY ====================

export interface Family {
  id: number;
  name: string;
  avatar: string;
  description: string | null;
  owner_id: number;
  invite_link: string;
  created_at: string;
  role?: string;
}

export interface FamilyStatus {
  title: string;
  emoji: string;
}

export interface FamilyMember {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: string;
  joined_at: string;
  status: FamilyStatus | null;
}

export interface JoinRequest {
  id: number;
  user_id: number;
  name: string;
  avatar: string;
  email: string;
  created_at: string;
  family_name?: string;
}

// ==================== RECIPES ====================

export interface Ingredient {
  id?: string;
  name: string;
  amount?: string;
  unit?: string;
}

export interface CookingStep {
  id?: string;
  title: string;
  text: string;
  imageUrl?: string;
}

export interface Recipe {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  image_urls: string[];
  video_url: string | null;
  meal_type: string;
  ingredients: Ingredient[];
  cooking_steps: CookingStep[];
  paired_recipe_ids: number[];
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar: string;
}

// ==================== NOTIFICATIONS ====================

export type NotificationType =
  | 'swipe_request'
  | 'swipe_response'
  | 'family_join_request'
  | 'family_join_response';

export interface AppNotification {
  id: number;
  user_id: number;
  type: NotificationType;
  from_user_id: number;
  message: string;
  sender_message: string | null;
  request_id: number | null;
  family_join_request_id: number | null;
  is_read: boolean;
  created_at: string;
  from_user_name: string;
  from_user_avatar: string;
}

// ==================== SWIPE REQUESTS ====================

export type SwipeMode = 'category' | 'select' | 'delivery';

export interface CreateSwipeRequestData {
  recipe_ids: number[];
  to_user_id?: number;
  to_family_id?: number;
  mode?: SwipeMode;
  category?: string;
  message?: string;
  delivery_ids?: number[];
}

// ==================== GENERIC API ENVELOPE ====================

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type EmptyResponse = ApiEnvelope<Record<string, never>>;
