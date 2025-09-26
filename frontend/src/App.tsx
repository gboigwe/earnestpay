import React, { useState } from 'react';
import { Layout, Typography, Space, Tabs, Row, Col, Card, Button, Form, Input, Select, InputNumber, Table, Tag, message } from 'antd';
import { UserOutlined, DollarOutlined, ScheduleOutlined, FileTextOutlined, LoginOutlined } from '@ant-design/icons';
import { WalletProvider } from './WalletProvider';
import { WalletConnection } from './WalletConnection';
import { EmployeePortal } from './EmployeePortal';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Mock data
const mockCompanyData = {
  name: 'Acme Corporation',
  treasuryBalance: 50000,
  employeeCount: 15,
  isRegistered: true
};

const mockEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@acme.com',
    role: 'Engineer',
    department: 'Engineering',
    salary: 75000,
    status: 'Active',
    address: '0x1234567890abcdef1234567890abcdef12345678'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@acme.com',
    role: 'Manager',
    department: 'Engineering',
    salary: 95000,
    status: 'Active',
    address: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@acme.com',
    role: 'HR',
    department: 'Human Resources',
    salary: 65000,
    status: 'Active',
    address: '0x9876543210fedcba9876543210fedcba98765432'
  }
];

const mockPaymentSchedules = [
  {
    id: 1,
    employeeName: 'John Doe',
    frequency: 'Monthly',
    amount: 6250, // Monthly salary
    nextPayment: '2025-10-01',
    status: 'Active'
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    frequency: 'Monthly',
    amount: 7916.67,
    nextPayment: '2025-10-01',
    status: 'Active'
  }
];

function App() {
  const [form] = Form.useForm();
  const [payrollForm] = Form.useForm();
  const [currentView, setCurrentView] = useState<'dashboard' | 'employee'>('dashboard');

  const handleRegisterCompany = (values: any) => {
    console.log('Registering company:', values);
    message.success('Company registered successfully!');
  };

  const handleAddEmployee = (values: any) => {
    console.log('Adding employee:', values);
    message.success('Employee added successfully!');
    form.resetFields();
  };

  const handleProcessPayroll = (values: any) => {
    console.log('Processing payroll:', values);
    message.success('Payroll processed successfully!');
    payrollForm.resetFields();
  };

  const handleFundTreasury = () => {
    message.success('Treasury funded successfully!');
  };

  const employeeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { 
      title: 'Salary', 
      dataIndex: 'salary', 
      key: 'salary',
      render: (salary: number) => `$${salary.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      )
    }
  ];

  const scheduleColumns = [
    { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`
    },
    { title: 'Next Payment', dataIndex: 'nextPayment', key: 'nextPayment' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      )
    }
  ];

  if (currentView === 'employee') {
    return (
      <WalletProvider>
        <EmployeePortal onBack={() => setCurrentView('dashboard')} />
      </WalletProvider>
    );
  }

  return (
    <WalletProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#001529', padding: '0 50px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            height: '100%'
          }}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              AptosPayroll
            </Title>
            <Space>
              <Button 
                icon={<LoginOutlined />}
                onClick={() => setCurrentView('employee')}
              >
                Employee Portal
              </Button>
              <div style={{ width: '300px' }}>
                <WalletConnection />
              </div>
            </Space>
          </div>
        </Header>
        
        <Content style={{ padding: '20px 50px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Company Overview */}
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                      ${mockCompanyData.treasuryBalance.toLocaleString()}
                    </div>
                    <div style={{ color: '#666' }}>Treasury Balance</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                      {mockCompanyData.employeeCount}
                    </div>
                    <div style={{ color: '#666' }}>Active Employees</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <ScheduleOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                    <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                      {mockPaymentSchedules.length}
                    </div>
                    <div style={{ color: '#666' }}>Active Schedules</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Button type="primary" onClick={handleFundTreasury}>
                      Fund Treasury
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Employees" key="1" icon={<UserOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Card title="Add New Employee">
                    <Form
                      form={form}
                      layout="inline"
                      onFinish={handleAddEmployee}
                      style={{ width: '100%' }}
                    >
                      <Form.Item name="firstName" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="First Name" />
                      </Form.Item>
                      <Form.Item name="lastName" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Last Name" />
                      </Form.Item>
                      <Form.Item name="email" rules={[{ required: true, type: 'email' }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Email" />
                      </Form.Item>
                      <Form.Item name="role" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Select placeholder="Role" style={{ width: 120 }}>
                          <Option value="Employee">Employee</Option>
                          <Option value="Manager">Manager</Option>
                          <Option value="HR">HR</Option>
                          <Option value="Accountant">Accountant</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="department" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Department" />
                      </Form.Item>
                      <Form.Item name="salary" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <InputNumber placeholder="Annual Salary" min={0} style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name="address" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Wallet Address" style={{ width: 250 }} />
                      </Form.Item>
                      <Form.Item style={{ marginBottom: '16px' }}>
                        <Button type="primary" htmlType="submit">
                          Add Employee
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card title="Employee List">
                    <Table 
                      columns={employeeColumns}
                      dataSource={mockEmployees}
                      rowKey="id"
                      pagination={false}
                    />
                  </Card>
                </Space>
              </TabPane>

              <TabPane tab="Payroll" key="2" icon={<DollarOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Card title="Process Payroll Payment">
                    <Form
                      form={payrollForm}
                      layout="inline"
                      onFinish={handleProcessPayroll}
                      style={{ width: '100%' }}
                    >
                      <Form.Item name="employee" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Select placeholder="Select Employee" style={{ width: 200 }}>
                          {mockEmployees.map(emp => (
                            <Option key={emp.id} value={emp.address}>{emp.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name="amount" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <InputNumber placeholder="Payment Amount" min={0} style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name="paymentType" rules={[{ required: true }]} style={{ marginBottom: '16px' }}>
                        <Select placeholder="Payment Type" style={{ width: 140 }}>
                          <Option value="salary">Salary</Option>
                          <Option value="bonus">Bonus</Option>
                          <Option value="overtime">Overtime</Option>
                          <Option value="commission">Commission</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item style={{ marginBottom: '16px' }}>
                        <Button type="primary" htmlType="submit">
                          Process Payment
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card title="Payment History">
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No payment history available yet. Process your first payment to see records here.
                    </div>
                  </Card>
                </Space>
              </TabPane>

              <TabPane tab="Schedules" key="3" icon={<ScheduleOutlined />}>
                <Card title="Payment Schedules">
                  <Table 
                    columns={scheduleColumns}
                    dataSource={mockPaymentSchedules}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </TabPane>

              <TabPane tab="Tax & Compliance" key="4" icon={<FileTextOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Card title="Tax Configuration">
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Tax configuration and compliance features coming soon.
                    </div>
                  </Card>
                  
                  <Card title="Compliance Reports">
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Generate compliance reports for tax authorities and audits.
                    </div>
                  </Card>
                </Space>
              </TabPane>
            </Tabs>
          </Space>
        </Content>
      </Layout>
    </WalletProvider>
  );
}

export default App;
