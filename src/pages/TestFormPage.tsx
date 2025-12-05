import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Button,
    Space,
    Typography,
    message,
    Card,
    Radio,
    Select,
    Checkbox,
    Divider,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { testService } from '../services/testService';
import { courseService } from '../services/courseService';
import { moduleService } from '../services/moduleService';
import { lessonService } from '../services/lessonService';
import type { Course, Module, Lesson } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

type PlacementType = 'lesson' | 'module' | 'course' | null;

const TestFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [placementType, setPlacementType] = useState<PlacementType>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const isEditMode = !!id;

    useEffect(() => {
        fetchCourses();
        if (isEditMode) {
            fetchTest();
        }
    }, [id]);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getCourses();
            setCourses(data);
        } catch (error: any) {
            message.error('Ошибка при загрузке курсов');
        }
    };

    const fetchModules = async (courseId: string) => {
        try {
            const data = await moduleService.getModules(courseId);
            setModules(data);
        } catch (error: any) {
            message.error('Ошибка при загрузке модулей');
        }
    };

    const fetchLessons = async (courseId: string, moduleId: string) => {
        try {
            const data = await lessonService.getLessons(courseId, moduleId);
            setLessons(data);
        } catch (error: any) {
            message.error('Ошибка при загрузке уроков');
        }
    };

    const fetchTest = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const test = await testService.getTestById(id);

            // Determine placement type
            let placement: PlacementType = null;
            if (test.lesson_id) {
                placement = 'lesson';
                // Note: We would need to fetch the course and module for this lesson
                // For simplicity, we'll just set the lesson_id
            } else if (test.module_id) {
                placement = 'module';
            } else if (test.course_id) {
                placement = 'course';
            }

            setPlacementType(placement);

            form.setFieldsValue({
                title: test.title,
                description: test.description,
                questions_to_show: test.questions_to_show,
                passing_score: test.passing_score,
                placement_type: placement,
                lesson_id: test.lesson_id,
                module_id: test.module_id,
                course_id: test.course_id,
                questions: test.questions.map(q => ({
                    text: q.text,
                    type: q.type || 'single_choice',
                    answers: q.answers.map(a => ({
                        text: a.text,
                        is_correct: a.is_correct,
                    })),
                })),
            });

            // Load related data if needed
            if (test.course_id) {
                setSelectedCourseId(test.course_id);
            }
            if (test.module_id) {
                // We would need course_id to fetch modules
                // This is a limitation - ideally the API should return full test details
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при загрузке теста');
        } finally {
            setLoading(false);
        }
    };

    const handlePlacementTypeChange = (value: PlacementType) => {
        setPlacementType(value);
        // Reset placement IDs
        form.setFieldsValue({
            lesson_id: undefined,
            module_id: undefined,
            course_id: undefined,
        });
        setSelectedCourseId(null);
        setSelectedModuleId(null);
        setModules([]);
        setLessons([]);
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        setSelectedModuleId(null);
        setLessons([]);

        if (placementType === 'course') {
            form.setFieldValue('course_id', courseId);
        } else if (placementType === 'module') {
            form.setFieldValue('module_id', undefined);
            fetchModules(courseId);
        } else if (placementType === 'lesson') {
            form.setFieldValue('lesson_id', undefined);
            form.setFieldValue('module_id', undefined);
            fetchModules(courseId);
        }
    };

    const handleModuleChange = (moduleId: string) => {
        setSelectedModuleId(moduleId);

        if (placementType === 'module') {
            form.setFieldValue('module_id', moduleId);
        } else if (placementType === 'lesson' && selectedCourseId) {
            form.setFieldValue('lesson_id', undefined);
            fetchLessons(selectedCourseId, moduleId);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                title: values.title,
                description: values.description,
                questions_to_show: values.questions_to_show || 0,
                passing_score: values.passing_score || 0,
                lesson_id: placementType === 'lesson' ? values.lesson_id : undefined,
                module_id: placementType === 'module' ? values.module_id : undefined,
                course_id: placementType === 'course' ? values.course_id : undefined,
                questions: values.questions || [],
            };

            if (isEditMode && id) {
                await testService.updateTest(id, payload);
                message.success('Тест обновлен');
            } else {
                await testService.createTest(payload);
                message.success('Тест создан');
            }
            navigate('/tests');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{isEditMode ? 'Редактировать тест' : 'Создать тест'}</Title>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    questions_to_show: 0,
                    passing_score: 0,
                    questions: [{ text: '', type: 'single_choice', answers: [{ text: '', is_correct: false }] }],
                }}
            >
                <Card title="Основная информация" style={{ marginBottom: 24 }}>
                    <Form.Item
                        label="Название теста"
                        name="title"
                        rules={[{ required: true, message: 'Введите название теста' }]}
                    >
                        <Input placeholder="Например: Итоговый тест по математике" />
                    </Form.Item>

                    <Form.Item label="Описание" name="description">
                        <TextArea rows={3} placeholder="Краткое описание теста" />
                    </Form.Item>

                    <Form.Item
                        label="Привязать тест к"
                        name="placement_type"
                        rules={[{ required: true, message: 'Выберите размещение теста' }]}
                    >
                        <Radio.Group onChange={(e) => handlePlacementTypeChange(e.target.value)}>
                            <Radio value="lesson">Урок</Radio>
                            <Radio value="module">Модуль</Radio>
                            <Radio value="course">Курс</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {placementType && (
                        <>
                            {(placementType === 'lesson' || placementType === 'module') && (
                                <Form.Item label="Выберите курс">
                                    <Select
                                        placeholder="Выберите курс"
                                        onChange={handleCourseChange}
                                        value={selectedCourseId}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {courses.map((course) => (
                                            <Select.Option key={course.id} value={course.id}>
                                                {course.title}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {placementType === 'course' && (
                                <Form.Item
                                    label="Курс"
                                    name="course_id"
                                    rules={[{ required: true, message: 'Выберите курс' }]}
                                >
                                    <Select
                                        placeholder="Выберите курс"
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {courses.map((course) => (
                                            <Select.Option key={course.id} value={course.id}>
                                                {course.title}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {placementType === 'lesson' && selectedCourseId && (
                                <Form.Item label="Выберите модуль">
                                    <Select
                                        placeholder="Выберите модуль"
                                        onChange={handleModuleChange}
                                        value={selectedModuleId}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {modules.map((module) => (
                                            <Select.Option key={module.id} value={module.id}>
                                                {module.title}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {placementType === 'module' && selectedCourseId && (
                                <Form.Item
                                    label="Модуль"
                                    name="module_id"
                                    rules={[{ required: true, message: 'Выберите модуль' }]}
                                >
                                    <Select
                                        placeholder="Выберите модуль"
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {modules.map((module) => (
                                            <Select.Option key={module.id} value={module.id}>
                                                {module.title}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            {placementType === 'lesson' && selectedModuleId && (
                                <Form.Item
                                    label="Урок"
                                    name="lesson_id"
                                    rules={[{ required: true, message: 'Выберите урок' }]}
                                >
                                    <Select
                                        placeholder="Выберите урок"
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {lessons.map((lesson) => (
                                            <Select.Option key={lesson.id} value={lesson.id}>
                                                {lesson.title}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                        </>
                    )}

                    <Space size="large">
                        <Form.Item
                            label="Показывать вопросов"
                            name="questions_to_show"
                            tooltip="0 = показать все вопросы"
                        >
                            <InputNumber min={0} placeholder="0" style={{ width: 150 }} />
                        </Form.Item>

                        <Form.Item
                            label="Проходной балл (%)"
                            name="passing_score"
                        >
                            <InputNumber min={0} max={100} placeholder="0" style={{ width: 150 }} />
                        </Form.Item>
                    </Space>
                </Card>

                <Card title="Вопросы" style={{ marginBottom: 24 }}>
                    <Form.List
                        name="questions"
                        rules={[
                            {
                                validator: async (_, questions) => {
                                    if (!questions || questions.length < 1) {
                                        return Promise.reject(new Error('Добавьте хотя бы один вопрос'));
                                    }
                                },
                            },
                        ]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Card
                                        key={field.key}
                                        type="inner"
                                        title={`Вопрос ${index + 1}`}
                                        extra={
                                            fields.length > 1 && (
                                                <Button
                                                    type="link"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(field.name)}
                                                >
                                                    Удалить вопрос
                                                </Button>
                                            )
                                        }
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Form.Item
                                            {...field}
                                            label="Текст вопроса"
                                            name={[field.name, 'text']}
                                            rules={[{ required: true, message: 'Введите текст вопроса' }]}
                                        >
                                            <TextArea rows={2} placeholder="Введите вопрос" />
                                        </Form.Item>

                                        <Form.Item
                                            {...field}
                                            label="Тип вопроса"
                                            name={[field.name, 'type']}
                                            initialValue="single_choice"
                                        >
                                            <Select>
                                                <Select.Option value="single_choice">Один правильный ответ</Select.Option>
                                                <Select.Option value="multiple_choice">Несколько правильных ответов</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Divider>Варианты ответов</Divider>

                                        <Form.List
                                            name={[field.name, 'answers']}
                                            rules={[
                                                {
                                                    validator: async (_, answers) => {
                                                        if (!answers || answers.length < 1) {
                                                            return Promise.reject(new Error('Добавьте хотя бы один вариант ответа'));
                                                        }
                                                    },
                                                },
                                            ]}
                                        >
                                            {(answerFields, { add: addAnswer, remove: removeAnswer }, { errors: answerErrors }) => (
                                                <>
                                                    {answerFields.map((answerField) => (
                                                        <Space key={answerField.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                                            <Form.Item
                                                                {...answerField}
                                                                name={[answerField.name, 'text']}
                                                                rules={[{ required: true, message: 'Введите текст ответа' }]}
                                                                style={{ flex: 1, marginBottom: 0 }}
                                                            >
                                                                <Input placeholder="Вариант ответа" />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...answerField}
                                                                name={[answerField.name, 'is_correct']}
                                                                valuePropName="checked"
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Checkbox>Правильный</Checkbox>
                                                            </Form.Item>

                                                            {answerFields.length > 1 && (
                                                                <MinusCircleOutlined
                                                                    onClick={() => removeAnswer(answerField.name)}
                                                                    style={{ color: '#ff4d4f' }}
                                                                />
                                                            )}
                                                        </Space>
                                                    ))}
                                                    <Form.Item>
                                                        <Button
                                                            type="dashed"
                                                            onClick={() => addAnswer({ text: '', is_correct: false })}
                                                            icon={<PlusOutlined />}
                                                            style={{ width: '100%' }}
                                                        >
                                                            Добавить вариант ответа
                                                        </Button>
                                                        <Form.ErrorList errors={answerErrors} />
                                                    </Form.Item>
                                                </>
                                            )}
                                        </Form.List>
                                    </Card>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add({ text: '', type: 'single_choice', answers: [{ text: '', is_correct: false }] })}
                                        icon={<PlusOutlined />}
                                        style={{ width: '100%' }}
                                    >
                                        Добавить вопрос
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode ? 'Сохранить изменения' : 'Создать тест'}
                        </Button>
                        <Button onClick={() => navigate('/tests')}>
                            Отмена
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default TestFormPage;
