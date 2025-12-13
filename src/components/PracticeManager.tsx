import React, { useEffect, useState } from 'react';
import {
    Drawer,
    List,
    Button,
    Space,
    Popconfirm,
    Form,
    Input,
    Select,
    message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CodeOutlined } from '@ant-design/icons';
import type { Practice } from '../types';
import { practicesService } from '../services/practicesService';

const { TextArea } = Input;
const { Option } = Select;

interface PracticeManagerProps {
    lessonId: string;
    open: boolean;
    onClose: () => void;
}

export const PracticeManager: React.FC<PracticeManagerProps> = ({ lessonId, open, onClose }) => {
    const [practices, setPractices] = useState<Practice[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPractice, setCurrentPractice] = useState<Practice | null>(null);
    const [form] = Form.useForm();

    const fetchPractices = async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const data = await practicesService.getByLessonId(lessonId);
            setPractices(data);
        } catch (error) {
            message.error('Ошибка при загрузке практик');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && lessonId) {
            fetchPractices();
            setIsEditing(false);
            setCurrentPractice(null);
        }
    }, [open, lessonId]);

    const handleDelete = async (id: string) => {
        try {
            await practicesService.delete(id);
            message.success('Практика удалена');
            fetchPractices();
        } catch (error) {
            message.error('Ошибка при удалении');
        }
    };

    const handleEdit = (practice: Practice) => {
        setCurrentPractice(practice);
        setIsEditing(true);
        form.setFieldsValue({
            ...practice,
            test_cases: JSON.stringify(practice.test_cases, null, 2)
        });
    };

    const handleCreate = () => {
        setCurrentPractice(null);
        setIsEditing(true);
        form.resetFields();
        // Set default values
        form.setFieldsValue({
            language: 'javascript',
            test_cases: '[]'
        });
    };

    const onFinish = async (values: any) => {
        try {
            // Parse test cases if it's a string
            let testCases = values.test_cases;
            try {
                testCases = JSON.parse(values.test_cases);
            } catch (e) {
                message.error('Ошибка в формате JSON для тест-кейсов');
                return;
            }

            const data = {
                ...values,
                test_cases: testCases
            };

            if (currentPractice) {
                await practicesService.update(currentPractice.id, data);
                message.success('Практика обновлена');
            } else {
                await practicesService.create(lessonId, data);
                message.success('Практика создана');
            }
            setIsEditing(false);
            fetchPractices();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при сохранении');
        }
    };

    const renderForm = () => (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                name="title"
                label="Название"
                rules={[{ required: true, message: 'Введите название' }]}
            >
                <Input placeholder="Например: Сложение чисел" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Описание"
            >
                <TextArea rows={4} placeholder="Описание задачи..." />
            </Form.Item>

            <Form.Item
                name="language"
                label="Язык"
                initialValue="javascript"
            >
                <Select>
                    <Option value="javascript">JavaScript</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="initial_code"
                label="Начальный код"
            >
                <TextArea rows={6} style={{ fontFamily: 'monospace' }} placeholder="// Код для студента" />
            </Form.Item>

            <Form.Item
                name="solution_code"
                label="Решение"
            >
                <TextArea rows={6} style={{ fontFamily: 'monospace' }} placeholder="// Правильное решение" />
            </Form.Item>

            <Form.Item
                name="expected_output"
                label="Ожидаемый вывод"
            >
                <Input placeholder="Что должно быть в консоли (опционально)" />
            </Form.Item>

            <Form.Item
                name="test_cases"
                label="Тест кейсы (JSON)"
                help="Массив объектов с input и output"
            >
                <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
            </Form.Item>

            <Space>
                <Button type="primary" htmlType="submit">
                    Сохранить
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                    Отмена
                </Button>
            </Space>
        </Form>
    );

    const renderList = () => (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ marginBottom: 16 }}>
                Добавить практику
            </Button>
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={practices}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)} />,
                            <Popconfirm key="delete" title="Удалить?" onConfirm={() => handleDelete(item.id)}>
                                <Button type="link" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<CodeOutlined />}
                            title={item.title}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />
        </>
    );

    return (
        <Drawer
            title="Управление практиками"
            width={720}
            onClose={onClose}
            open={open}
        >
            {isEditing ? renderForm() : renderList()}
        </Drawer>
    );
};
