import api from './api';
import type { Test, CreateTestDto, UpdateTestDto, TestResult } from '../types';

export const testService = {
    getAllTests: async (): Promise<Test[]> => {
        const response = await api.get<Test[]>('/tests');
        return response.data;
    },

    getTestById: async (id: string): Promise<Test> => {
        const response = await api.get<Test>(`/tests/${id}`);
        return response.data;
    },

    createTest: async (data: CreateTestDto): Promise<Test> => {
        const response = await api.post<Test>('/tests', data);
        return response.data;
    },

    updateTest: async (id: string, data: UpdateTestDto): Promise<Test> => {
        const response = await api.patch<Test>(`/tests/${id}`, data);
        return response.data;
    },

    deleteTest: async (id: string): Promise<Test> => {
        const response = await api.delete<Test>(`/tests/${id}`);
        return response.data;
    },

    getModuleTestResults: async (moduleId: string): Promise<TestResult[]> => {
        const response = await api.get<TestResult[]>(`/tests/module/${moduleId}/results`);
        return response.data;
    },

    getCourseTestResults: async (courseId: string): Promise<TestResult[]> => {
        const response = await api.get<TestResult[]>(`/tests/course/${courseId}/results`);
        return response.data;
    },


};
