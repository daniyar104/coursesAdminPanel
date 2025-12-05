import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin } from 'antd';
import {
    BookOutlined,
    FolderOutlined,
    FileTextOutlined,
    UserOutlined,
    StarOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardService.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return <div>Нет данных</div>;
    }

    const topCoursesColumns = [
        {
            title: 'Курс',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Категория',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Записей',
            dataIndex: 'enrollmentCount',
            key: 'enrollmentCount',
            sorter: (a: any, b: any) => a.enrollmentCount - b.enrollmentCount,
        },
        {
            title: 'Отзывов',
            dataIndex: 'reviewCount',
            key: 'reviewCount',
        },
        {
            title: 'Рейтинг',
            dataIndex: 'avgRating',
            key: 'avgRating',
            render: (rating: number) => (
                <span>
                    <StarOutlined style={{ color: '#faad14' }} /> {Number(rating || 0).toFixed(1)}
                </span>
            ),
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Всего курсов"
                            value={stats.overview.totalCourses}
                            prefix={<BookOutlined />}
                            styles={{ content: { color: '#667eea' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Модулей"
                            value={stats.overview.totalModules}
                            prefix={<FolderOutlined />}
                            styles={{ content: { color: '#764ba2' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Уроков"
                            value={stats.overview.totalLessons}
                            prefix={<FileTextOutlined />}
                            styles={{ content: { color: '#f093fb' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Записей на курсы"
                            value={stats.overview.totalEnrollments}
                            prefix={<UserOutlined />}
                            styles={{ content: { color: '#4facfe' } }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Категорий"
                            value={stats.overview.totalCategories}
                            prefix={<FolderOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Активных записей"
                            value={stats.overview.activeEnrollments}
                            prefix={<RiseOutlined />}
                            styles={{ content: { color: '#52c41a' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Отзывов"
                            value={stats.overview.totalReviews}
                            prefix={<StarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Средний рейтинг"
                            value={Number(stats.overview.averageRating || 0).toFixed(1)}
                            prefix={<StarOutlined />}
                            styles={{ content: { color: '#faad14' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Top Courses Table */}
            <Card title="Топ курсов" style={{ marginBottom: 24 }}>
                <Table
                    columns={topCoursesColumns}
                    dataSource={stats.topCourses}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Записи за последние 30 дней">
                        <Statistic
                            value={stats.recentActivity.enrollmentsLast30Days}
                            prefix={<UserOutlined />}
                            styles={{ content: { color: '#3f8600' } }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
