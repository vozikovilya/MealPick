import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from './services/api';
import type { User, Family, Recipe, Notification, FamilyMember, JoinRequest } from './services/api';

interface AppState {
  // User state
  currentUser: User | null;
  family: Family | null;
  familyMembers: FamilyMember[];
  pendingRequests: JoinRequest[];
  recipes: Recipe[];
  notifications: Notification[];
  unreadCount: number;
  
  // Auth actions
  register: (data: api.RegisterData) => Promise<void>;
  login: (data: api.LoginData) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  
  // Family actions
  createFamily: (data: { name: string; avatar?: string; description?: string }) => Promise<void>;
  loadFamily: () => Promise<void>;
  joinFamily: (inviteLink: string) => Promise<void>;
  deleteFamily: () => Promise<void>;
  respondToJoinRequest: (requestId: number, accept: boolean) => Promise<void>;
  addFamilyStatus: (userId: number, title: string, emoji: string) => Promise<void>;
  
  // Recipe actions
  loadRecipes: () => Promise<void>;
  createRecipe: (data: any) => Promise<void>;
  deleteRecipe: (recipeId: number) => Promise<void>;
  
  // Notification actions
  loadNotifications: () => Promise<void>;
  updateNotifications: (data: any) => Promise<void>;
  
  // Swipe request actions
  createSwipeRequest: (data: any) => Promise<void>;
  respondToSwipeRequest: (requestId: number, selectedRecipeIds: number[]) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      family: null,
      familyMembers: [],
      pendingRequests: [],
      recipes: [],
      notifications: [],
      unreadCount: 0,
      
      // Auth actions
      register: async (data) => {
        const response = await api.register(data);
        set({ currentUser: response.data.user });
      },
      
      login: async (data) => {
        const response = await api.login(data);
        set({ currentUser: response.data.user });
        await get().loadProfile();
      },
      
      logout: () => {
        api.logout();
        set({
          currentUser: null,
          family: null,
          familyMembers: [],
          pendingRequests: [],
          recipes: [],
          notifications: [],
          unreadCount: 0,
        });
      },
      
      loadProfile: async () => {
        try {
          const response = await api.getProfile();
          set({
            currentUser: response.data.user,
            family: response.data.family,
          });
          if (response.data.family) {
            await get().loadFamily();
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      },
      
      updateProfile: async (data) => {
        await api.updateProfile(data);
        await get().loadProfile();
      },
      
      // Family actions
      createFamily: async (data) => {
        await api.createFamily(data);
        await get().loadFamily();
      },
      
      loadFamily: async () => {
        try {
          const response = await api.getFamily();
          set({
            family: response.data.family,
            familyMembers: response.data.members,
            pendingRequests: response.data.pendingRequests,
          });
        } catch (error) {
          console.error('Error loading family:', error);
        }
      },
      
      joinFamily: async (inviteLink) => {
        await api.joinFamily(inviteLink);
      },
      
      deleteFamily: async () => {
        await api.deleteFamily();
        set({ family: null, familyMembers: [], pendingRequests: [] });
      },
      
      respondToJoinRequest: async (requestId, accept) => {
        await api.respondToJoinRequest(requestId, accept);
        await get().loadFamily();
      },
      
      addFamilyStatus: async (userId, title, emoji) => {
        await api.addFamilyStatus(userId, title, emoji);
        await get().loadFamily();
      },
      
      // Recipe actions
      loadRecipes: async () => {
        try {
          const response = await api.getRecipes();
          set({ recipes: response.data.recipes });
        } catch (error) {
          console.error('Error loading recipes:', error);
        }
      },
      
      createRecipe: async (data) => {
        await api.createRecipe(data);
        await get().loadRecipes();
      },
      
      deleteRecipe: async (recipeId) => {
        await api.deleteRecipe(recipeId);
        await get().loadRecipes();
      },
      
      // Notification actions
      loadNotifications: async () => {
        try {
          const response = await api.getNotifications();
          set({
            notifications: response.data.notifications,
            unreadCount: response.data.unreadCount,
          });
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      },
      
      updateNotifications: async (data) => {
        await api.updateNotifications(data);
        await get().loadNotifications();
      },
      
      // Swipe request actions
      createSwipeRequest: async (data) => {
        await api.createSwipeRequest(data);
      },
      
      respondToSwipeRequest: async (requestId, selectedRecipeIds) => {
        await api.respondToSwipeRequest(requestId, selectedRecipeIds);
      },
    }),
    {
      name: 'mealpick-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);
