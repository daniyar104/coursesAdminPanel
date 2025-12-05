import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../store/categoryStore';
import type { Category } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CategoriesPage: React.FC = () => {
    const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            description: category.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id);
            message.success('Категория удалена');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при удалении');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, values);
                message.success('Категория обновлена');
            } else {
                await createCategory(values);
                message.success('Категория создана');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Ошибка при сохранении');
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Курсов',
            dataIndex: ['_count', 'courses'],
            key: 'courses',
            sorter: (a: Category, b: Category) => (a._count?.courses || 0) - (b._count?.courses || 0),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: Category) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить категорию?"
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
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Категории</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Создать категорию
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Название"
                        name="name"
                        rules={[
                            { required: true, message: 'Введите название' },
                            { max: 200, message: 'Максимум 200 символов' },
                        ]}
                    >
                        <Input placeholder="Название категории" />
                    </Form.Item>

                    <Form.Item
                        label="Описание"
                        name="description"
                    >
                        <TextArea rows={4} placeholder="Описание категории" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingCategory ? 'Сохранить' : 'Создать'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
