import { create } from 'zustand';
import type { Module } from '../types';
import { moduleService } from '../services/moduleService';

interface ModuleState {
    modules: Module[];
    loading: boolean;
    error: string | null;
    fetchModules: (courseId: string) => Promise<void>;
    createModule: (courseId: string, data: any) => Promise<void>;
    updateModule: (courseId: string, id: string, data: any) => Promise<void>;
    deleteModule: (courseId: string, id: string) => Promise<void>;
    reorderModule: (courseId: string, id: string, position: number) => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set) => ({
    modules: [],
    loading: false,
    error: null,

    fetchModules: async (courseId) => {
        set({ loading: true, error: null });
        try {
            const modules = await moduleService.getModules(courseId);
            set({ modules, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch modules', loading: false });
            throw error;
        }
    },

    createModule: async (courseId, data) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.createModule(courseId, data);
            set((state) => ({
                modules: [...state.modules, response.module],
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to create module', loading: false });
            throw error;
        }
    },

    updateModule: async (courseId, id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.updateModule(courseId, id, data);
            set((state) => ({
                modules: state.modules.map((mod) =>
                    mod.id === id ? response.module : mod
                ),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to update module', loading: false });
            throw error;
        }
    },

    deleteModule: async (courseId, id) => {
        set({ loading: true, error: null });
        try {
            await moduleService.deleteModule(courseId, id);
            set((state) => ({
                modules: state.modules.filter((mod) => mod.id !== id),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete module', loading: false });
            throw error;
        }
    },

    reorderModule: async (courseId, id, position) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.reorderModule(courseId, id, position);
            set((state) => ({
                modules: state.modules.map((mod) =>
                    mod.id === id ? response.module : mod
                ).sort((a, b) => a.position - b.position),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to reorder module', loading: false });
            throw error;
        }
    },
}));
