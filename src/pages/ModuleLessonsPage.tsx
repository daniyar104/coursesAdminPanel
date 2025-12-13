import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
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
    Upload,
    Select,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    MenuOutlined,
    UploadOutlined,
    CodeOutlined,
} from '@ant-design/icons';
import { PracticeManager } from '../components/PracticeManager';
import { useLessonStore } from '../store/lessonStore';
import { useCourseStore } from '../store/courseStore';
import { useModuleStore } from '../store/moduleStore';
import type { Lesson } from '../types';
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

interface SortableLessonItemProps {
    lesson: Lesson;
    onEdit: (lesson: Lesson) => void;
    onDelete: (id: string) => void;
    onUpload: (id: string, file: File) => Promise<void>;
    onManagePractices: (lessonId: string) => void;
}

const SortableLessonItem: React.FC<SortableLessonItemProps> = ({ lesson, onEdit, onDelete, onUpload, onManagePractices }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <List.Item
                actions={[
                    <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(lesson)}>
                        Изменить
                    </Button>,
                    <Button type="link" icon={<CodeOutlined />} onClick={() => onManagePractices(lesson.id)}>
                        Практики
                    </Button>,
                    <Popconfirm
                        title="Удалить урок?"
                        onConfirm={() => onDelete(lesson.id)}
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
                            <Tag color="green">#{lesson.position + 1}</Tag>
                            {lesson.title}
                            <Tag color="blue">
                                {lesson.material_type === 'PRESENTATION' && 'Презентация'}
                                {lesson.material_type === 'VIDEO' && 'Видео'}
                                {lesson.material_type === 'LECTURE_MATERIAL' && 'Лекционный материал'}
                            </Tag>
                        </Space>
                    }
                    description={
                        <Space direction="vertical" size="small">
                            {lesson.content && <Text type="secondary">Контент: есть</Text>}
                            {lesson.material_url && (
                                <Text type="secondary">
                                    Материал: есть
                                    {lesson.material_type === 'VIDEO' && ' (Видео)'}
                                    {lesson.material_type === 'PRESENTATION' && ' (PDF)'}
                                    {lesson.material_type === 'LECTURE_MATERIAL' && ' (PDF)'}
                                </Text>
                            )}
                            <Upload
                                beforeUpload={(file) => {
                                    let isValid = false;
                                    let errorMessage = '';

                                    if (lesson.material_type === 'VIDEO') {
                                        // Разрешаем видео файлы
                                        const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv', 'video/webm'];
                                        isValid = videoTypes.includes(file.type) || file.name.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i) !== null;
                                        errorMessage = 'Можно загружать только видео файлы (MP4, AVI, MOV, WMV, FLV, MKV, WEBM)!';

                                        // Проверка размера видео (макс 500MB)
                                        if (isValid && file.size > 500 * 1024 * 1024) {
                                            message.error('Размер видео файла не должен превышать 500MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                    } else {
                                        // Для презентаций и лекционных материалов разрешаем только PDF
                                        isValid = file.type === 'application/pdf';
                                        errorMessage = 'Можно загружать только PDF файлы!';

                                        // Проверка размера PDF (макс 50MB)
                                        if (isValid && file.size > 50 * 1024 * 1024) {
                                            message.error('Размер PDF файла не должен превышать 50MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                    }

                                    if (!isValid) {
                                        message.error(errorMessage);
                                    }
                                    return isValid || Upload.LIST_IGNORE;
                                }}
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    try {
                                        await onUpload(lesson.id, file as File);
                                        onSuccess?.('ok');
                                    } catch (e) {
                                        onError?.(e as any);
                                    }
                                }}
                                showUploadList={false}
                            >
                                <Button size="small" icon={<UploadOutlined />}>
                                    {lesson.material_type === 'VIDEO' ? 'Загрузить видео' : 'Загрузить PDF'}
                                </Button>
                            </Upload>
                        </Space>
                    }
                />
            </List.Item>
        </div>
    );
};

const ModuleLessonsPage: React.FC = () => {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const navigate = useNavigate();
    const { currentCourse, fetchCourse } = useCourseStore();
    const { modules, fetchModules } = useModuleStore();
    const { lessons, loading, fetchLessons, createLesson, updateLesson, deleteLesson, reorderLesson, uploadMaterial } = useLessonStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [practiceDrawerOpen, setPracticeDrawerOpen] = useState(false);
    const [selectedLessonForPractice, setSelectedLessonForPractice] = useState<string | null>(null);
    const [form] = Form.useForm();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (courseId && moduleId) {
            fetchCourse(courseId);
            fetchModules(courseId);
            fetchLessons(courseId, moduleId);
        }
    }, [courseId, moduleId]);

    const currentModule = modules.find((m) => m.id === moduleId);

    const handleUpload = async (lessonId: string, file: File) => {
        if (!courseId || !moduleId) return;
        try {
            await uploadMaterial(courseId, moduleId, lessonId, file);
            message.success('Материал загружен');
        } catch (error: any) {
            message.error(error.message || 'Ошибка загрузки');
        }
    };

    const handleCreate = () => {
        setEditingLesson(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        form.setFieldsValue({
            title: lesson.title,
            content: lesson.content,
            material_type: lesson.material_type,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (lessonId: string) => {
        if (!courseId || !moduleId) return;
        try {
            await deleteLesson(courseId, moduleId, lessonId);
            message.success('Урок удален');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при удалении');
        }
    };

    const handleSubmit = async (values: any) => {
        if (!courseId || !moduleId) return;

        try {
            if (editingLesson) {
                await updateLesson(courseId, moduleId, editingLesson.id, values);
                message.success('Урок обновлен');
            } else {
                await createLesson(courseId, moduleId, values);
                message.success('Урок создан');
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
            const oldIndex = lessons.findIndex((l) => l.id === active.id);
            const newIndex = lessons.findIndex((l) => l.id === over.id);

            arrayMove(lessons, oldIndex, newIndex);

            if (courseId && moduleId) {
                try {
                    await reorderLesson(courseId, moduleId, active.id as string, newIndex);
                    message.success('Порядок уроков обновлен');
                } catch (error) {
                    message.error('Ошибка при изменении порядка');
                    fetchLessons(courseId, moduleId);
                }
            }
        }
    };

    if (!currentCourse || !currentModule) {
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
                <Breadcrumb.Item>
                    <a onClick={() => navigate(`/courses/${courseId}`)}>{currentCourse.title}</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{currentModule.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/courses/${courseId}`)}
                style={{ marginBottom: 16 }}
            >
                Назад к модулям
            </Button>

            <Card
                title={<Title level={3}>{currentModule.title} - Уроки</Title>}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Добавить урок
                    </Button>
                }
            >
                {lessons.length === 0 ? (
                    <Text type="secondary">Уроков пока нет. Создайте первый урок.</Text>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                            <List
                                loading={loading}
                                dataSource={lessons}
                                renderItem={(lesson) => (
                                    <SortableLessonItem
                                        key={lesson.id}
                                        lesson={lesson}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onUpload={handleUpload}
                                        onManagePractices={(id) => {
                                            setSelectedLessonForPractice(id);
                                            setPracticeDrawerOpen(true);
                                        }}
                                    />
                                )}
                            />
                        </SortableContext>
                    </DndContext>
                )}
            </Card>

            <Modal
                title={editingLesson ? 'Редактировать урок' : 'Создать урок'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
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
                        <Input placeholder="Название урока" />
                    </Form.Item>

                    <Form.Item
                        label="Тип материала"
                        name="material_type"
                        rules={[
                            { required: true, message: 'Выберите тип материала' },
                        ]}
                    >
                        <Select placeholder="Выберите тип материала">
                            <Select.Option value="PRESENTATION">Презентация</Select.Option>
                            <Select.Option value="VIDEO">Видео</Select.Option>
                            <Select.Option value="LECTURE_MATERIAL">Лекционный материал</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Контент" name="content">
                        <TextArea rows={6} placeholder="Текстовое содержание урока" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingLesson ? 'Сохранить' : 'Создать'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {selectedLessonForPractice && (
                <PracticeManager
                    lessonId={selectedLessonForPractice}
                    open={practiceDrawerOpen}
                    onClose={() => {
                        setPracticeDrawerOpen(false);
                        setSelectedLessonForPractice(null);
                    }}
                />
            )}
        </div>
    );
};

export default ModuleLessonsPage;
