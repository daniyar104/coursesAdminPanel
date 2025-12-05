import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, register } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (isLogin) {
                const response = await authService.login(values);
                login(response.user, response.token);
                message.success('Успешный вход');
            } else {
                await register({ ...values, role: 'teacher' });
                message.success('Регистрация успешна');
            }
            navigate('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 16,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
                bodyStyle={{ padding: '40px 32px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        {isLogin ? 'Вход в систему' : 'Регистрация преподавателя'}
                    </Title>
                    <Text type="secondary">
                        {isLogin
                            ? 'Введите свои данные для входа'
                            : 'Заполните форму для создания аккаунта'}
                    </Text>
                </div>

                <Form
                    name="auth_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    {!isLogin && (
                        <>
                            <Space style={{ display: 'flex', marginBottom: 0 }} align="start">
                                <Form.Item
                                    name="first_name"
                                    rules={[{ required: true, message: 'Введите имя' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Имя" />
                                </Form.Item>
                                <Form.Item
                                    name="surname"
                                    rules={[{ required: true, message: 'Введите фамилию' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Фамилия" />
                                </Form.Item>
                            </Space>
                        </>
                    )}

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Введите Email' },
                            { type: 'email', message: 'Некорректный Email' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                    </Form.Item>

                    {!isLogin && (
                        <Form.Item
                            name="secretKey"
                            rules={[{ required: true, message: 'Введите секретный ключ администратора' }]}
                            tooltip="Ключ для регистрации преподавателей"
                        >
                            <Input.Password prefix={<KeyOutlined />} placeholder="Секретный ключ" />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">
                            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                            <a onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Зарегистрироваться' : 'Войти'}
                            </a>
                        </Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
