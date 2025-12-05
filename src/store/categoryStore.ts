import { create } from 'zustand';
import type { Category } from '../types';
import { categoryService } from '../services/categoryService';

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    createCategory: (data: { name: string; description?: string }) => Promise<void>;
    updateCategory: (id: string, data: { name?: string; description?: string }) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    loading: false,
    error: null,

    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            const categories = await categoryService.getCategories();
            set({ categories, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch categories', loading: false });
            throw error;
        }
    },

    createCategory: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryService.createCategory(data);
            set((state) => ({
                categories: [...state.categories, response.category],
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to create category', loading: false });
            throw error;
        }
    },

    updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryService.updateCategory(id, data);
            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat.id === id ? response.category : cat
                ),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to update category', loading: false });
            throw error;
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            await categoryService.deleteCategory(id);
            set((state) => ({
                categories: state.categories.filter((cat) => cat.id !== id),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete category', loading: false });
            throw error;
        }
    },
}));
