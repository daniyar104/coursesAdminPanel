import React, { useEffect, useState } from 'react';
import { Table, Button, Drawer, Form, Input, Select, Space, Typography, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { useCategoryStore } from '../store/categoryStore';
import type { Course } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CoursesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { courses, loading, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourseStore();
    const { categories, fetchCategories } = useCategoryStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    // Filter courses for non-admin users (teachers)
    const filteredCourses = React.useMemo(() => {
        if (!user || user.role === 'admin') {
            return courses;
        }

        // For teachers/others, filter by teacher_id
        return courses.filter(course => {
            // Check both snake_case and camelCase just in case, and normalize IDs
            const courseTeacherId = course.teacher_id || (course as any).teacherId || (course as any).userId;
            return String(courseTeacherId) === String(user.id);
        });
    }, [courses, user]);

    const handleCreate = () => {
        setEditingCourse(null);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        form.setFieldsValue({
            title: course.title,
            short_description: course.short_description,
            full_description: course.full_description,
            difficulty_level: course.difficulty_level,
            category_id: course.category_id,
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCourse(id);
            message.success('Курс удален');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при удалении');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, values);
                message.success('Курс обновлен');
            } else {
                // Add teacher_id explicitly if backend doesn't infer it (safety)
                const newCourse = await createCourse(values);
                message.success('Курс создан');
                navigate(`/courses/${newCourse.id}`);
            }
            setIsDrawerOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при сохранении');
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: Course, b: Course) => a.title.localeCompare(b.title),
        },
        {
            title: 'Категория',
            dataIndex: ['categories', 'name'],
            key: 'category',
        },
        {
            title: 'Сложность',
            dataIndex: 'difficulty_level',
            key: 'difficulty',
            render: (level: string) => {
                const colors: any = {
                    'Beginner': 'green',
                    'Intermediate': 'orange',
                    'Advanced': 'red',
                };
                return level ? <Tag color={colors[level] || 'blue'}>{level}</Tag> : '-';
            },
        },
        {
            title: 'Модулей',
            dataIndex: ['_count', 'modules'],
            key: 'modules',
        },
        {
            title: 'Уроков',
            dataIndex: ['_count', 'lessons'],
            key: 'lessons',
        },
        {
            title: 'Записей',
            dataIndex: ['_count', 'enrollments'],
            key: 'enrollments',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: Course) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/courses/${record.id}`)}
                    >
                        Открыть
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить курс?"
                        description="Это удалит все модули и уроки"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Курсы</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Создать курс
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredCourses}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Drawer
                title={editingCourse ? 'Редактировать курс' : 'Создать курс'}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[
                            { required: true, message: 'Введите название' },
                            { max: 300, message: 'Максимум 300 символов' },
                        ]}
                    >
                        <Input placeholder="Название курса" />
                    </Form.Item>

                    <Form.Item
                        label="Категория"
                        name="category_id"
                        rules={[{ required: true, message: 'Выберите категорию' }]}
                    >
                        <Select placeholder="Выберите категорию">
                            {categories.map((cat) => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Сложность"
                        name="difficulty_level"
                    >
                        <Select placeholder="Выберите сложность">
                            <Select.Option value="Beginner">Beginner</Select.Option>
                            <Select.Option value="Intermediate">Intermediate</Select.Option>
                            <Select.Option value="Advanced">Advanced</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Краткое описание"
                        name="short_description"
                        rules={[{ max: 1000, message: 'Максимум 1000 символов' }]}
                    >
                        <TextArea rows={3} placeholder="Краткое описание курса" />
                    </Form.Item>

                    <Form.Item
                        label="Полное описание"
                        name="full_description"
                    >
                        <TextArea rows={6} placeholder="Полное описание курса" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingCourse ? 'Сохранить' : 'Создать'}
                            </Button>
                            <Button onClick={() => setIsDrawerOpen(false)}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default CoursesPage;
