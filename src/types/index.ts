// ============= User & Auth Types =============
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    first_name: string;
    surname: string;
    email: string;
    password: string;
    role: 'teacher';
    secretKey: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// ============= Category Types =============
export interface Category {
    id: string;
    name: string;
    description: string | null;
    created_at: Date;
    _count?: {
        courses: number;
    };
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
}

// ============= Course Types =============
export interface Course {
    id: string;
    title: string;
    short_description: string | null;
    full_description: string | null;
    difficulty_level: string | null;
    category_id: string;
    created_at: Date;
    updated_at: Date;
    teacher_id?: string;
    categories?: Category;
    _count?: {
        modules: number;
        lessons: number;
        enrollments: number;
        reviews: number;
    };
}

export interface CreateCourseDto {
    title: string;
    short_description?: string;
    full_description?: string;
    difficulty_level?: string;
    category_id: string;
    teacher_id?: string;
}

export interface UpdateCourseDto {
    title?: string;
    short_description?: string;
    full_description?: string;
    difficulty_level?: string;
    category_id?: string;
}

// ============= Module Types =============
export interface Module {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    position: number;
    created_at: Date;
    _count?: {
        lessons: number;
    };
    lessons?: Lesson[];
}

export interface CreateModuleDto {
    title: string;
    description?: string;
    position?: number;
}

export interface UpdateModuleDto {
    title?: string;
    description?: string;
    position?: number;
}

// ============= Lesson Types =============
export type MaterialType = 'PRESENTATION' | 'VIDEO' | 'LECTURE_MATERIAL';

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    content: string | null;
    material_type: MaterialType;
    material_url?: string | null;
    position: number;
    created_at: Date;
}

export interface CreateLessonDto {
    title: string;
    content?: string;
    material_type: MaterialType;
    position?: number;
}

export interface UpdateLessonDto {
    title?: string;
    content?: string;
    material_type?: MaterialType;
    position?: number;
}

// ============= Dashboard Types =============
export interface DashboardStats {
    overview: {
        totalCourses: number;
        totalModules: number;
        totalLessons: number;
        totalEnrollments: number;
        totalCategories: number;
        totalReviews: number;
        activeEnrollments: number;
        averageRating: number;
    };
    recentActivity: {
        enrollmentsLast30Days: number;
    };
    topCourses: Array<{
        id: string;
        title: string;
        category: string;
        enrollmentCount: number;
        reviewCount: number;
        avgRating: number;
    }>;
}

export interface CourseStats {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    avgRating: number;
    content: {
        modules: number;
        lessons: number;
    };
    enrollments: {
        total: number;
        active: number;
        averageProgress: number;
    };
    reviews: {
        total: number;
    };
}

export interface DetailedCourseStats {
    course: {
        id: string;
        title: string;
        category: string;
        difficulty: string;
        avgRating: number;
        reviewCount: number;
    };
    content: {
        modulesCount: number;
        lessonsCount: number;
    };
    enrollments: {
        total: number;
        active: number;
        completed: number;
        averageProgress: number;
    };
    engagement: {
        lessonCompletions: number;
        completionRate: number;
    };
    reviews: {
        total: number;
        ratingDistribution: Array<{ rating: number; count: number }>;
        recent: Array<{
            id: string;
            rating: number;
            text: string;
            date: Date;
            user: string;
        }>;
    };
    trend: {
        enrollmentsLast7Days: number;
    };
}

// ============= Test Types =============
export interface Answer {
    id?: string;
    text: string;
    is_correct: boolean;
}

export interface Question {
    id?: string;
    text: string;
    type?: string;
    answers: Answer[];
}

export interface Test {
    id: string;
    title: string;
    description: string | null;
    lesson_id: string | null;
    module_id: string | null;
    course_id: string | null;
    questions_to_show: number;
    passing_score: number;
    created_at: Date;
    questions: Question[];
}

export interface CreateTestDto {
    title: string;
    description?: string;
    lesson_id?: string;
    module_id?: string;
    course_id?: string;
    questions_to_show?: number;
    passing_score?: number;
    questions: Array<{
        text: string;
        type?: string;
        answers: Array<{ text: string; is_correct: boolean }>;
    }>;
}

export interface UpdateTestDto {
    title?: string;
    description?: string;
    lesson_id?: string;
    module_id?: string;
    course_id?: string;
    questions_to_show?: number;
    passing_score?: number;
    questions?: Array<{
        text: string;
        type?: string;
        answers: Array<{ text: string; is_correct: boolean }>;
    }>;
}

export interface TestResult {
    userId: string;
    firstName: string;
    surname: string;
    email: string;
    score: number;
    passed: boolean;
    completedAt: Date;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    success?: boolean;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}
