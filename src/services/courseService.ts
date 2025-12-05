import api from './api';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types';

export const courseService = {
    getCourses: async (): Promise<Course[]> => {
        const response = await api.get<Course[]>('/admin/courses');
        return response.data;
    },

    getCourse: async (id: string): Promise<Course> => {
        const response = await api.get<Course>(`/admin/courses/${id}`);
        return response.data;
    },

    createCourse: async (data: CreateCourseDto): Promise<{ message: string; course: Course }> => {
        const response = await api.post<{ message: string; course: Course }>('/admin/courses', data);
        return response.data;
    },

    updateCourse: async (id: string, data: UpdateCourseDto): Promise<{ message: string; course: Course }> => {
        const response = await api.patch<{ message: string; course: Course }>(`/admin/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: string): Promise<{ message: string; deletedModules: number; affectedEnrollments: number }> => {
        const response = await api.delete<{ message: string; deletedModules: number; affectedEnrollments: number }>(`/admin/courses/${id}`);
        return response.data;
    },
};
