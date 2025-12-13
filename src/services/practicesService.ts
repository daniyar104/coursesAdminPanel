import api from './api';
import type { Practice, CreatePracticeDto, UpdatePracticeDto } from '../types';

export const practicesService = {
    // Get all practices for a lesson
    getByLessonId: async (lessonId: string) => {
        const response = await api.get<Practice[]>(`/practices/lesson/${lessonId}`);
        return response.data;
    },

    // Get a specific practice
    getById: async (id: string) => {
        const response = await api.get<Practice>(`/practices/${id}`);
        return response.data;
    },

    // Create a new practice
    create: async (lessonId: string, data: CreatePracticeDto) => {
        const response = await api.post<Practice>(`/practices/lesson/${lessonId}`, data);
        return response.data;
    },

    // Update a practice
    update: async (id: string, data: UpdatePracticeDto) => {
        const response = await api.patch<Practice>(`/practices/${id}`, data);
        return response.data;
    },

    // Delete a practice
    delete: async (id: string) => {
        const response = await api.delete<Practice>(`/practices/${id}`);
        return response.data;
    }
};
