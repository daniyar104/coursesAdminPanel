import api from './api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const categoryService = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/admin/categories');
        return response.data;
    },

    getCategory: async (id: string): Promise<Category> => {
        const response = await api.get<Category>(`/admin/categories/${id}`);
        return response.data;
    },

    createCategory: async (data: CreateCategoryDto): Promise<{ message: string; category: Category }> => {
        const response = await api.post<{ message: string; category: Category }>('/admin/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: UpdateCategoryDto): Promise<{ message: string; category: Category }> => {
        const response = await api.patch<{ message: string; category: Category }>(`/admin/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/admin/categories/${id}`);
        return response.data;
    },
};
