import { create } from 'zustand';
import { lessonService } from '../services/lessonService';
import type { Lesson, UpdateLessonDto } from '../types';

interface LessonState {
    lessons: Lesson[];
    loading: boolean;
    error: string | null;
    fetchLessons: (courseId: string, moduleId: string) => Promise<void>;
    createLesson: (courseId: string, moduleId: string, data: any) => Promise<void>;
    updateLesson: (courseId: string, moduleId: string, lessonId: string, lesson: UpdateLessonDto) => Promise<void>;
    deleteLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<void>;
    reorderLesson: (courseId: string, moduleId: string, lessonId: string, position: number) => Promise<void>;
    uploadMaterial: (courseId: string, moduleId: string, lessonId: string, file: File) => Promise<void>;
}

export const useLessonStore = create<LessonState>((set, get) => ({
    lessons: [],
    loading: false,
    error: null,

    fetchLessons: async (courseId, moduleId) => {
        set({ loading: true, error: null });
        try {
            const lessons = await lessonService.getLessons(courseId, moduleId);
            set({ lessons });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch lessons' });
        } finally {
            set({ loading: false });
        }
    },

    createLesson: async (courseId, moduleId, data) => {
        set({ loading: true, error: null });
        try {
            await lessonService.createLesson(courseId, moduleId, data);
            await get().fetchLessons(courseId, moduleId);
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to create lesson' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateLesson: async (courseId, moduleId, lessonId, data) => {
        set({ loading: true, error: null });
        try {
            await lessonService.updateLesson(courseId, moduleId, lessonId, data);
            await get().fetchLessons(courseId, moduleId);
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to update lesson' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteLesson: async (courseId, moduleId, lessonId) => {
        set({ loading: true, error: null });
        try {
            await lessonService.deleteLesson(courseId, moduleId, lessonId);
            await get().fetchLessons(courseId, moduleId);
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to delete lesson' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    reorderLesson: async (courseId, moduleId, lessonId, position) => {
        try {
            await lessonService.reorderLesson(courseId, moduleId, lessonId, position);
            // State is already updated optimistically or via fetchLessons
        } catch (error) {
            set({ error: 'Failed to reorder lessons' });
            throw error;
        }
    },

    uploadMaterial: async (courseId, moduleId, lessonId, file) => {
        set({ loading: true, error: null });
        try {
            await lessonService.uploadMaterial(courseId, moduleId, lessonId, file);
            await get().fetchLessons(courseId, moduleId);
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to upload material' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));
