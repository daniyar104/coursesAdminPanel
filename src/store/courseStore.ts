import { create } from 'zustand';
import type { Course } from '../types';
import { courseService } from '../services/courseService';

interface CourseState {
    courses: Course[];
    currentCourse: Course | null;
    loading: boolean;
    error: string | null;
    fetchCourses: () => Promise<void>;
    fetchCourse: (id: string) => Promise<void>;
    createCourse: (data: any) => Promise<Course>;
    updateCourse: (id: string, data: any) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
    courses: [],
    currentCourse: null,
    loading: false,
    error: null,

    fetchCourses: async () => {
        set({ loading: true, error: null });
        try {
            const courses = await courseService.getCourses();
            set({ courses, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch courses', loading: false });
            throw error;
        }
    },

    fetchCourse: async (id) => {
        set({ loading: true, error: null });
        try {
            const course = await courseService.getCourse(id);
            set({ currentCourse: course, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch course', loading: false });
            throw error;
        }
    },

    createCourse: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.createCourse(data);
            set((state) => ({
                courses: [...state.courses, response.course],
                loading: false,
            }));
            return response.course;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create course', loading: false });
            throw error;
        }
    },

    updateCourse: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.updateCourse(id, data);
            set((state) => ({
                courses: state.courses.map((course) =>
                    course.id === id ? response.course : course
                ),
                currentCourse: state.currentCourse?.id === id ? response.course : state.currentCourse,
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to update course', loading: false });
            throw error;
        }
    },

    deleteCourse: async (id) => {
        set({ loading: true, error: null });
        try {
            await courseService.deleteCourse(id);
            set((state) => ({
                courses: state.courses.filter((course) => course.id !== id),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete course', loading: false });
            throw error;
        }
    },
}));
