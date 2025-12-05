import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLayout from '../components/AdminLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CategoriesPage from '../pages/CategoriesPage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import ModuleLessonsPage from '../pages/ModuleLessonsPage';
import TestsPage from '../pages/TestsPage';
import TestFormPage from '../pages/TestFormPage';
import TestResultsPage from '../pages/TestResultsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="courses/:id" element={<CourseDetailPage />} />
                    <Route path="courses/:courseId/modules/:moduleId/lessons" element={<ModuleLessonsPage />} />
                    <Route path="tests" element={<TestsPage />} />
                    <Route path="tests/new" element={<TestFormPage />} />
                    <Route path="tests/:id/edit" element={<TestFormPage />} />
                    <Route path="tests/:type/:id/results" element={<TestResultsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
