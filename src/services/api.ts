/**
 * API сервис для работы с backend
 */

const API_BASE_URL = 'http://q91929se.beget.tech/backend/api';

/**
 * Получение токена из localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Установка токена в localStorage
 */
function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Удаление токена из localStorage
 */
function removeToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Базовая функция для выполнения запросов
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Ошибка запроса');
  }

  return data;
}

// ==================== AUTH ====================

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

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  avatar: string;
  description: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

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

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
    family: Family | null;
    status: FamilyStatus | null;
  };
}

export async function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/user/profile.php', {
    method: 'GET',
  });
}

export async function updateProfile(data: Partial<User> & { password?: string }): Promise<any> {
  return apiRequest('/user/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(): Promise<any> {
  return apiRequest('/user/delete.php', {
    method: 'DELETE',
  });
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

export interface FamilyMember {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: string;
  joined_at: string;
  status: FamilyStatus | null;
}

export interface FamilyStatus {
  title: string;
  emoji: string;
}

export interface JoinRequest {
  id: number;
  user_id: number;
  name: string;
  avatar: string;
  email: string;
  created_at: string;
}

export interface FamilyResponse {
  success: boolean;
  data: {
    family: Family | null;
    members: FamilyMember[];
    pendingRequests: JoinRequest[];
  };
}

export async function createFamily(data: {
  name: string;
  avatar?: string;
  description?: string;
}): Promise<any> {
  return apiRequest('/family/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getFamily(): Promise<FamilyResponse> {
  return apiRequest<FamilyResponse>('/family/get.php', {
    method: 'GET',
  });
}

export async function joinFamily(inviteLink: string): Promise<any> {
  return apiRequest('/family/join.php', {
    method: 'POST',
    body: JSON.stringify({ invite_link: inviteLink }),
  });
}

export async function respondToJoinRequest(requestId: number, accept: boolean): Promise<any> {
  return apiRequest('/family/respond-request.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, accept }),
  });
}

export async function addFamilyStatus(userId: number, title: string, emoji: string): Promise<any> {
  return apiRequest('/family/add-status.php', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, title, emoji }),
  });
}

export async function removeFamilyStatus(userId: number): Promise<any> {
  return apiRequest('/family/remove-status.php', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeFamilyMember(memberId: number): Promise<any> {
  return apiRequest('/family/remove-member.php', {
    method: 'DELETE',
    body: JSON.stringify({ member_id: memberId }),
  });
}

export async function deleteFamily(): Promise<any> {
  return apiRequest('/family/delete.php', {
    method: 'DELETE',
  });
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

export interface RecipesResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
  };
}

export async function getRecipes(): Promise<RecipesResponse> {
  return apiRequest<RecipesResponse>('/recipes/list.php', {
    method: 'GET',
  });
}

export async function createRecipe(data: {
  name: string;
  description?: string;
  image_urls?: string[];
  video_url?: string;
  meal_type: string;
  ingredients?: Ingredient[];
  cooking_steps?: CookingStep[];
  paired_recipe_ids?: number[];
}): Promise<any> {
  return apiRequest('/recipes/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecipe(recipeId: number, data: {
  name?: string;
  description?: string;
  image_urls?: string[];
  video_url?: string;
  meal_type?: string;
  ingredients?: Ingredient[];
  cooking_steps?: CookingStep[];
  paired_recipe_ids?: number[];
}): Promise<any> {
  return apiRequest('/recipes/update.php', {
    method: 'PUT',
    body: JSON.stringify({ recipe_id: recipeId, ...data }),
  });
}

export async function deleteRecipe(recipeId: number): Promise<any> {
  return apiRequest('/recipes/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ recipe_id: recipeId }),
  });
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number;
  user_id: number;
  type: 'swipe_request' | 'swipe_response' | 'family_join_request' | 'family_join_response';
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

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

export async function getNotifications(): Promise<NotificationsResponse> {
  return apiRequest<NotificationsResponse>('/notifications/list.php', {
    method: 'GET',
  });
}

export async function updateNotifications(data: {
  notification_id?: number;
  notification_ids?: number[];
  mark_all_read?: boolean;
  delete_ids?: number[];
}): Promise<any> {
  return apiRequest('/notifications/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== SWIPE REQUESTS ====================

export async function getSwipeRequest(requestId: number): Promise<any> {
  return apiRequest(`/swipe/get.php?id=${requestId}`, {
    method: 'GET',
  });
}

export async function createSwipeRequest(data: {
  recipe_ids: number[];
  to_user_id?: number;
  to_family_id?: number;
  mode?: 'category' | 'select' | 'delivery';
  category?: string;
  message?: string;
  delivery_ids?: number[];
}): Promise<any> {
  return apiRequest('/swipe/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function respondToSwipeRequest(
  requestId: number,
  selectedRecipeIds: number[]
): Promise<any> {
  return apiRequest('/swipe/respond.php', {
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
