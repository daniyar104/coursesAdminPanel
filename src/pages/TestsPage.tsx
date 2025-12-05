import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/testService';
import type { Test } from '../types';

const { Title } = Typography;

const TestsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const data = await testService.getAllTests();
            setTests(data);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при загрузке тестов');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await testService.deleteTest(id);
            message.success('Тест удален');
            fetchTests();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при удалении');
        }
    };

    const getAssociatedWith = (test: Test) => {
        if (test.lesson_id) return { type: 'Урок', id: test.lesson_id };
        if (test.module_id) return { type: 'Модуль', id: test.module_id };
        if (test.course_id) return { type: 'Курс', id: test.course_id };
        return { type: 'Не привязан', id: null };
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: Test, b: Test) => a.title.localeCompare(b.title),
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text: string) => text || '-',
        },
        {
            title: 'Привязан к',
            key: 'associated',
            render: (_: any, record: Test) => {
                const { type } = getAssociatedWith(record);
                const colors: any = {
                    'Урок': 'blue',
                    'Модуль': 'green',
                    'Курс': 'purple',
                    'Не привязан': 'default',
                };
                return <Tag color={colors[type]}>{type}</Tag>;
            },
        },
        {
            title: 'Вопросов',
            key: 'questions',
            render: (_: any, record: Test) => record.questions?.length || 0,
        },
        {
            title: 'Показывать',
            dataIndex: 'questions_to_show',
            key: 'questions_to_show',
            render: (value: number) => value === 0 ? 'Все' : value,
        },
        {
            title: 'Проходной балл',
            dataIndex: 'passing_score',
            key: 'passing_score',
            render: (value: number) => `${value}%`,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: Test) => {
                const canViewResults = record.module_id || record.course_id;

                return (
                    <Space>
                        {canViewResults && (
                            <Button
                                type="link"
                                icon={<BarChartOutlined />}
                                onClick={() => {
                                    const type = record.module_id ? 'module' : 'course';
                                    const id = record.module_id || record.course_id;
                                    navigate(`/tests/${type}/${id}/results`);
                                }}
                            >
                                Результаты
                            </Button>
                        )}
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/tests/${record.id}/edit`)}
                        >
                            Изменить
                        </Button>
                        <Popconfirm
                            title="Удалить тест?"
                            description="Это действие нельзя отменить"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Да"
                            cancelText="Нет"
                        >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                                Удалить
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Тесты</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/tests/new')}
                >
                    Создать тест
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={tests}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default TestsPage;
