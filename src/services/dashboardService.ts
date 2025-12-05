import api from './api';
import type { DashboardStats, CourseStats, DetailedCourseStats } from '../types';

export const dashboardService = {
    getDashboardStats: async (): Promise<{ data: DashboardStats }> => {
        const response = await api.get<{ data: DashboardStats }>('/admin/dashboard/stats');
        return response.data;
    },

    getCoursesStats: async (): Promise<{ data: CourseStats[] }> => {
        const response = await api.get<{ data: CourseStats[] }>('/admin/dashboard/courses');
        return response.data;
    },

    getCourseStats: async (id: string): Promise<{ data: DetailedCourseStats }> => {
        const response = await api.get<{ data: DetailedCourseStats }>(`/admin/dashboard/courses/${id}/stats`);
        return response.data;
    },
};
