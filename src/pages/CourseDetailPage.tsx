import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Button,
    List,
    Modal,
    Form,
    Input,
    Space,
    Typography,
    message,
    Popconfirm,
    Breadcrumb,
    Tag,
    Spin,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    MenuOutlined,
} from '@ant-design/icons';
import { useCourseStore } from '../store/courseStore';
import { useModuleStore } from '../store/moduleStore';
import type { Module } from '../types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SortableModuleItemProps {
    module: Module;
    onEdit: (module: Module) => void;
    onDelete: (id: string) => void;
    onViewLessons: (moduleId: string) => void;
}

const SortableModuleItem: React.FC<SortableModuleItemProps> = ({ module, onEdit, onDelete, onViewLessons }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <List.Item
                actions={[
                    <Button
                        type="link"
                        icon={<FileTextOutlined />}
                        onClick={() => onViewLessons(module.id)}
                    >
                        Уроки ({module._count?.lessons || 0})
                    </Button>,
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(module)}
                    >
                        Изменить
                    </Button>,
                    <Popconfirm
                        title="Удалить модуль?"
                        description="Это удалит все уроки в модуле"
                        onConfirm={() => onDelete(module.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Удалить
                        </Button>
                    </Popconfirm>,
                ]}
            >
                <List.Item.Meta
                    avatar={
                        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0 8px' }}>
                            <MenuOutlined />
                        </div>
                    }
                    title={
                        <Space>
                            <Tag color="blue">#{module.position + 1}</Tag>
                            {module.title}
                        </Space>
                    }
                    description={module.description}
                />
            </List.Item>
        </div>
    );
};

const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentCourse, loading: courseLoading, fetchCourse } = useCourseStore();
    const { modules, loading: modulesLoading, fetchModules, createModule, updateModule, deleteModule, reorderModule } = useModuleStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [form] = Form.useForm();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchCourse(id);
            fetchModules(id);
        }
    }, [id]);

    const handleCreate = () => {
        setEditingModule(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (module: Module) => {
        setEditingModule(module);
        form.setFieldsValue({
            title: module.title,
            description: module.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (moduleId: string) => {
        if (!id) return;
        try {
            await deleteModule(id, moduleId);
            message.success('Модуль удален');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при удалении');
        }
    };

    const handleSubmit = async (values: any) => {
        if (!id) return;
        try {
            if (editingModule) {
                await updateModule(id, editingModule.id, values);
                message.success('Модуль обновлен');
            } else {
                await createModule(id, values);
                message.success('Модуль создан');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при сохранении');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = modules.findIndex((m) => m.id === active.id);
            const newIndex = modules.findIndex((m) => m.id === over.id);

            arrayMove(modules, oldIndex, newIndex);

            // Update position on server
            if (id) {
                try {
                    await reorderModule(id, active.id as string, newIndex);
                    message.success('Порядок модулей обновлен');
                } catch (error) {
                    message.error('Ошибка при изменении порядка');
                    fetchModules(id); // Reload on error
                }
            }
        }
    };

    const handleViewLessons = (moduleId: string) => {
        navigate(`/courses/${id}/modules/${moduleId}/lessons`);
    };

    if (courseLoading || !currentCourse) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/courses')}>Курсы</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{currentCourse.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/courses')}
                style={{ marginBottom: 16 }}
            >
                Назад к курсам
            </Button>

            <Card title={<Title level={2}>{currentCourse.title}</Title>} style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Категория">
                        {currentCourse.categories?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Сложность">
                        {currentCourse.difficulty_level ? (
                            <Tag color="blue">{currentCourse.difficulty_level}</Tag>
                        ) : (
                            '-'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Модулей">
                        {currentCourse._count?.modules || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Уроков">
                        {currentCourse._count?.lessons || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Записей">
                        {currentCourse._count?.enrollments || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Отзывов">
                        {currentCourse._count?.reviews || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Краткое описание" span={2}>
                        {currentCourse.short_description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Полное описание" span={2}>
                        {currentCourse.full_description || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title="Модули"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Добавить модуль
                    </Button>
                }
            >
                {modules.length === 0 ? (
                    <Text type="secondary">Модулей пока нет. Создайте первый модуль.</Text>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                            <List
                                loading={modulesLoading}
                                dataSource={modules}
                                renderItem={(module) => (
                                    <SortableModuleItem
                                        key={module.id}
                                        module={module}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onViewLessons={handleViewLessons}
                                    />
                                )}
                            />
                        </SortableContext>
                    </DndContext>
                )}
            </Card>

            <Modal
                title={editingModule ? 'Редактировать модуль' : 'Создать модуль'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[
                            { required: true, message: 'Введите название' },
                            { max: 300, message: 'Максимум 300 символов' },
                        ]}
                    >
                        <Input placeholder="Название модуля" />
                    </Form.Item>

                    <Form.Item label="Описание" name="description">
                        <TextArea rows={4} placeholder="Описание модуля" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={modulesLoading}>
                                {editingModule ? 'Сохранить' : 'Создать'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseDetailPage;
