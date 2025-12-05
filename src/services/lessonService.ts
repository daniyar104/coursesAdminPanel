import api from './api';
import type { Lesson, CreateLessonDto, UpdateLessonDto } from '../types';

export const lessonService = {
    getLessons: async (courseId: string, moduleId: string): Promise<Lesson[]> => {
        const response = await api.get<Lesson[]>(`/admin/courses/${courseId}/modules/${moduleId}/lessons`);
        return response.data;
    },

    getLesson: async (courseId: string, moduleId: string, id: string): Promise<Lesson> => {
        const response = await api.get<Lesson>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${id}`);
        return response.data;
    },

    createLesson: async (courseId: string, moduleId: string, data: CreateLessonDto): Promise<{ message: string; lesson: Lesson }> => {
        const response = await api.post<{ message: string; lesson: Lesson }>(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, data);
        return response.data;
    },

    updateLesson: async (courseId: string, moduleId: string, id: string, data: UpdateLessonDto): Promise<{ message: string; lesson: Lesson }> => {
        const response = await api.patch<{ message: string; lesson: Lesson }>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${id}`, data);
        return response.data;
    },

    deleteLesson: async (courseId: string, moduleId: string, id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${id}`);
        return response.data;
    },

    reorderLesson: async (courseId: string, moduleId: string, id: string, position: number): Promise<{ message: string; lesson: Lesson }> => {
        const response = await api.patch<{ message: string; lesson: Lesson }>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${id}/reorder`, { position });
        return response.data;
    },

    uploadMaterial: async (courseId: string, moduleId: string, id: string, file: File): Promise<{ message: string; lesson: Lesson }> => {
        console.log('=== Upload Material Debug ===');
        console.log('File object:', file);
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);

        const formData = new FormData();
        formData.append('file', file, file.name);

        // Log FormData contents
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            const response = await api.post<{ message: string; lesson: Lesson }>(
                `/admin/courses/${courseId}/modules/${moduleId}/lessons/${id}/material`,
                formData,
                {
                    headers: {
                        'Content-Type': undefined, // Let axios set it automatically
                    },
                }
            );
            console.log('Upload successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Upload error:', error.response?.data || error.message);
            throw error;
        }
    },
};
