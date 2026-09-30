/**
 * API-клиент MealPick.
 *
 * Все доменные типы вынесены в src/types; здесь только транспортный слой:
 * базовый URL (настраивается через VITE_API_BASE_URL), работа с токеном
 * (через lib/storage) и типизированные обёртки над эндпоинтами PHP-бэкенда.
 */

import { readStorage, writeStorage, removeStorage, STORAGE_KEYS } from '../lib/storage';
import type {
  ApiEnvelope,
  EmptyResponse,
  Family,
  FamilyMember,
  FamilyStatus,
  Ingredient,
  CookingStep,
  JoinRequest,
  LoginData,
  AppNotification,
  Recipe,
  RegisterData,
  SwipeMode,
  CreateSwipeRequestData,
  User,
} from '../types';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) ??
  'http://q91929se.beget.tech/backend/api';

// ==================== TOKEN ====================

function getToken(): string | null {
  return readStorage(STORAGE_KEYS.authToken);
}

function setToken(token: string): void {
  writeStorage(STORAGE_KEYS.authToken, token);
}

function removeToken(): void {
  removeStorage(STORAGE_KEYS.authToken);
}

// ==================== TRANSPORT ====================

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as ApiEnvelope<unknown> & { success: boolean };

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Ошибка запроса');
  }

  return data as T;
}

// ==================== AUTH ====================

export type AuthResponse = ApiEnvelope<{ token: string; user: User }>;

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.data.token);
  return response;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.data.token);
  return response;
}

export function logout(): void {
  removeToken();
}

// ==================== USER ====================

export type ProfileResponse = ApiEnvelope<{
  user: User;
  family: Family | null;
  status: FamilyStatus | null;
}>;

export async function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/user/profile.php', { method: 'GET' });
}

export async function updateProfile(
  data: Partial<User> & { password?: string },
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/user/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/user/delete.php', { method: 'DELETE' });
}

// ==================== FAMILY ====================

export type FamilyResponse = ApiEnvelope<{
  family: Family | null;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
}>;

export interface MyJoinRequestResponse
  extends ApiEnvelope<{ request: (JoinRequest & { family_name?: string }) | null }> {}

export async function createFamily(data: {
  name: string;
  avatar?: string;
  description?: string;
}): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getFamily(): Promise<FamilyResponse> {
  return apiRequest<FamilyResponse>('/family/get.php', { method: 'GET' });
}

export async function updateFamily(data: {
  name?: string;
  avatar?: string;
}): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function joinFamily(inviteLink: string): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/join.php', {
    method: 'POST',
    body: JSON.stringify({ invite_link: inviteLink }),
  });
}

export async function getMyJoinRequest(): Promise<MyJoinRequestResponse> {
  return apiRequest<MyJoinRequestResponse>('/family/my-request.php', { method: 'GET' });
}

export async function respondToJoinRequest(
  requestId: number,
  accept: boolean,
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/respond-request.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, accept }),
  });
}

export async function addFamilyStatus(
  userId: number,
  title: string,
  emoji: string,
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/add-status.php', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, title, emoji }),
  });
}

export async function removeFamilyStatus(userId: number): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/remove-status.php', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeFamilyMember(memberId: number): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/remove-member.php', {
    method: 'DELETE',
    body: JSON.stringify({ member_id: memberId }),
  });
}

export async function assignFamilyRole(
  userId: number,
  role: string,
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/assign-role.php', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, role }),
  });
}

export async function leaveFamily(): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/leave.php', { method: 'POST' });
}

export async function transferOwnership(newOwnerId: number): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/transfer-ownership.php', {
    method: 'POST',
    body: JSON.stringify({ new_owner_id: newOwnerId }),
  });
}

export async function deleteFamily(): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/family/delete.php', { method: 'DELETE' });
}

// ==================== RECIPES ====================

export type RecipesResponse = ApiEnvelope<{ recipes: Recipe[] }>;

export interface RecipeInput {
  name: string;
  description?: string;
  image_urls?: string[];
  video_url?: string;
  meal_type: string;
  ingredients?: Ingredient[];
  cooking_steps?: CookingStep[];
  paired_recipe_ids?: number[];
}

export async function getRecipes(): Promise<RecipesResponse> {
  return apiRequest<RecipesResponse>('/recipes/list.php', { method: 'GET' });
}

export async function createRecipe(
  data: RecipeInput,
): Promise<ApiEnvelope<{ recipe: Recipe }>> {
  return apiRequest<ApiEnvelope<{ recipe: Recipe }>>('/recipes/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecipe(
  recipeId: number,
  data: Partial<RecipeInput>,
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/recipes/update.php', {
    method: 'PUT',
    body: JSON.stringify({ recipe_id: recipeId, ...data }),
  });
}

export async function deleteRecipe(recipeId: number): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/recipes/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ recipe_id: recipeId }),
  });
}

// ==================== NOTIFICATIONS ====================

export type NotificationsResponse = ApiEnvelope<{
  notifications: AppNotification[];
  unreadCount: number;
}>;

export async function getNotifications(): Promise<NotificationsResponse> {
  return apiRequest<NotificationsResponse>('/notifications/list.php', { method: 'GET' });
}

export async function updateNotifications(data: {
  notification_id?: number;
  notification_ids?: number[];
  mark_all_read?: boolean;
  delete_ids?: number[];
}): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/notifications/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== SWIPE REQUESTS ====================

export interface SwipeRequestDto {
  id: number;
  from_user_id: number;
  to_user_id: number;
  mode: SwipeMode;
  category: string | null;
  message: string | null;
  status: string;
  recipe_ids: number[];
  selected_recipe_ids: number[] | null;
  created_at: string;
  responded_at: string | null;
  from_user_name?: string;
  from_user_avatar?: string;
  [key: string]: unknown;
}

export interface SwipeRequestDetailData {
  request: SwipeRequestDto;
  recipes: Recipe[];
  deliveries: unknown[];
  family_members: Pick<User, 'id' | 'name' | 'avatar'>[];
  to_user: Pick<User, 'id' | 'name' | 'avatar'> | null;
}

export async function getSwipeRequest(
  requestId: number,
): Promise<ApiEnvelope<SwipeRequestDetailData>> {
  return apiRequest<ApiEnvelope<SwipeRequestDetailData>>(
    `/swipe/get.php?id=${requestId}`,
    { method: 'GET' },
  );
}

export async function createSwipeRequest(
  data: CreateSwipeRequestData,
): Promise<ApiEnvelope<{ request: SwipeRequestDto }>> {
  return apiRequest<ApiEnvelope<{ request: SwipeRequestDto }>>('/swipe/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function respondToSwipeRequest(
  requestId: number,
  selectedRecipeIds: number[],
): Promise<EmptyResponse> {
  return apiRequest<EmptyResponse>('/swipe/respond.php', {
    method: 'POST',
    body: JSON.stringify({
      request_id: requestId,
      selected_recipe_ids: selectedRecipeIds,
    }),
  });
}

// ==================== UTILS ====================

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      email: payload.email,
      username: payload.username,
      name: '',
      avatar: '',
      description: null,
    };
  } catch {
    return null;
  }
}

// Реэкспорт типов для обратной совместимости импортов вида
// `import type { Recipe } from './services/api'`.
export type {
  Family,
  FamilyMember,
  FamilyStatus,
  Ingredient,
  CookingStep,
  JoinRequest,
  AppNotification as Notification,
  Recipe,
  RegisterData,
  LoginData,
  User,
};
