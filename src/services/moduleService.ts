import api from './api';
import type { Module, CreateModuleDto, UpdateModuleDto } from '../types';

export const moduleService = {
    getModules: async (courseId: string): Promise<Module[]> => {
        const response = await api.get<Module[]>(`/admin/courses/${courseId}/modules`);
        return response.data;
    },

    getModule: async (courseId: string, id: string): Promise<Module> => {
        const response = await api.get<Module>(`/admin/courses/${courseId}/modules/${id}`);
        return response.data;
    },

    createModule: async (courseId: string, data: CreateModuleDto): Promise<{ message: string; module: Module }> => {
        const response = await api.post<{ message: string; module: Module }>(`/admin/courses/${courseId}/modules`, data);
        return response.data;
    },

    updateModule: async (courseId: string, id: string, data: UpdateModuleDto): Promise<{ message: string; module: Module }> => {
        const response = await api.patch<{ message: string; module: Module }>(`/admin/courses/${courseId}/modules/${id}`, data);
        return response.data;
    },

    deleteModule: async (courseId: string, id: string): Promise<{ message: string; deletedLessons: number }> => {
        const response = await api.delete<{ message: string; deletedLessons: number }>(`/admin/courses/${courseId}/modules/${id}`);
        return response.data;
    },

    reorderModule: async (courseId: string, id: string, position: number): Promise<{ message: string; module: Module }> => {
        const response = await api.patch<{ message: string; module: Module }>(`/admin/courses/${courseId}/modules/${id}/reorder`, { position });
        return response.data;
    },
};
