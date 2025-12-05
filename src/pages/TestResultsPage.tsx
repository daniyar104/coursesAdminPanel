import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Button, Tag, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { testService } from '../services/testService';
import type { TestResult } from '../types';

const { Title } = Typography;

const TestResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const { type, id } = useParams<{ type: string; id: string }>();
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [type, id]);

    const fetchResults = async () => {
        if (!type || !id) return;

        setLoading(true);
        try {
            let data: TestResult[];
            if (type === 'module') {
                data = await testService.getModuleTestResults(id);
            } else if (type === 'course') {
                data = await testService.getCourseTestResults(id);
            } else {
                message.error('Неверный тип теста');
                return;
            }
            setResults(data);
        } catch (error: any) {
            if (error.response?.status === 403) {
                message.error('Недостаточно прав для просмотра результатов');
            } else {
                message.error(error.response?.data?.message || 'Ошибка при загрузке результатов');
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Студент',
            key: 'student',
            render: (_: any, record: TestResult) => `${record.firstName} ${record.surname}`,
            sorter: (a: TestResult, b: TestResult) =>
                `${a.firstName} ${a.surname}`.localeCompare(`${b.firstName} ${b.surname}`),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Балл',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => `${score}%`,
            sorter: (a: TestResult, b: TestResult) => a.score - b.score,
        },
        {
            title: 'Статус',
            key: 'status',
            render: (_: any, record: TestResult) => (
                <Tag
                    icon={record.passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={record.passed ? 'success' : 'error'}
                >
                    {record.passed ? 'Сдан' : 'Не сдан'}
                </Tag>
            ),
            filters: [
                { text: 'Сдан', value: true },
                { text: 'Не сдан', value: false },
            ],
            onFilter: (value: any, record: TestResult) => record.passed === value,
        },
        {
            title: 'Дата завершения',
            dataIndex: 'completedAt',
            key: 'completedAt',
            render: (date: Date) => new Date(date).toLocaleString('ru-RU'),
            sorter: (a: TestResult, b: TestResult) =>
                new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
        },
    ];

    const getTitle = () => {
        if (type === 'module') {
            return 'Результаты теста модуля';
        } else if (type === 'course') {
            return 'Результаты теста курса';
        }
        return 'Результаты теста';
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tests')}
                >
                    Назад к тестам
                </Button>
            </Space>

            <Title level={2}>{getTitle()}</Title>

            {results.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    Нет результатов для отображения
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={results}
                    rowKey="userId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default TestResultsPage;
