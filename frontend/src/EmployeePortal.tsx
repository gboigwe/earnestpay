import React from 'react';
import { Layout, Typography, Space, Card, Table, Tag, Button, Row, Col, Statistic } from 'antd';
import { DollarCircleOutlined, CalendarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Mock employee data
const mockEmployeeData = {
  name: 'John Doe',
  id: 'EMP001',
  department: 'Engineering',
  position: 'Senior Software Engineer',
  hireDate: '2023-01-15',
  salary: 75000,
  address: '0x1234567890abcdef1234567890abcdef12345678'
};

const mockPaymentHistory = [
  {
    id: 1,
    date: '2025-09-01',
    type: 'Salary',
    grossAmount: 6250,
    taxes: 1875,
    netAmount: 4375,
    status: 'Processed'
  },
  {
    id: 2,
    date: '2025-08-01',
    type: 'Salary',
    grossAmount: 6250,
    taxes: 1875,
    netAmount: 4375,
    status: 'Processed'
  },
  {
    id: 3,
    date: '2025-07-15',
    type: 'Bonus',
    grossAmount: 2000,
    taxes: 600,
    netAmount: 1400,
    status: 'Processed'
  }
];

const mockTaxDocuments = [
  {
    id: 1,
    year: '2024',
    type: 'W-2',
    status: 'Available',
    downloadUrl: '#'
  },
  {
    id: 2,
    year: '2024',
    type: 'Tax Summary',
    status: 'Available',
    downloadUrl: '#'
  }
];

const mockUpcomingPayments = [
  {
    id: 1,
    type: 'Monthly Salary',
    amount: 6250,
    date: '2025-10-01',
    status: 'Scheduled'
  }
];

interface EmployeePortalProps {
  onBack: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ onBack }) => {
  const paymentColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { 
      title: 'Gross Amount', 
      dataIndex: 'grossAmount', 
      key: 'grossAmount',
      render: (amount: number) => `$${amount.toLocaleString()}`
    },
    { 
      title: 'Taxes', 
      dataIndex: 'taxes', 
      key: 'taxes',
      render: (amount: number) => `$${amount.toLocaleString()}`
    },
    { 
      title: 'Net Amount', 
      dataIndex: 'netAmount', 
      key: 'netAmount',
      render: (amount: number) => `$${amount.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Processed' ? 'green' : 'blue'}>{status}</Tag>
      )
    }
  ];

  const documentColumns = [
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: 'Document Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Available' ? 'green' : 'orange'}>{status}</Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" onClick={() => console.log('Download document')}>
          Download
        </Button>
      )
    }
  ];

  const upcomingColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color="blue">{status}</Tag>
      )
    }
  ];

  // Calculate YTD totals
  const ytdGross = mockPaymentHistory.reduce((sum, payment) => sum + payment.grossAmount, 0);
  const ytdTaxes = mockPaymentHistory.reduce((sum, payment) => sum + payment.taxes, 0);
  const ytdNet = mockPaymentHistory.reduce((sum, payment) => sum + payment.netAmount, 0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 50px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Employee Portal - {mockEmployeeData.name}
          </Title>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </Header>
      
      <Content style={{ padding: '20px 50px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Employee Info */}
          <Card title="Personal Information">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Text strong>Employee ID:</Text>
                <div>{mockEmployeeData.id}</div>
              </Col>
              <Col span={6}>
                <Text strong>Department:</Text>
                <div>{mockEmployeeData.department}</div>
              </Col>
              <Col span={6}>
                <Text strong>Position:</Text>
                <div>{mockEmployeeData.position}</div>
              </Col>
              <Col span={6}>
                <Text strong>Hire Date:</Text>
                <div>{mockEmployeeData.hireDate}</div>
              </Col>
            </Row>
          </Card>

          {/* Summary Stats */}
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="YTD Gross Pay"
                  value={ytdGross}
                  prefix={<DollarCircleOutlined />}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="YTD Taxes Withheld"
                  value={ytdTaxes}
                  prefix={<FileTextOutlined />}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="YTD Net Pay"
                  value={ytdNet}
                  prefix={<DollarCircleOutlined />}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Annual Salary"
                  value={mockEmployeeData.salary}
                  prefix={<UserOutlined />}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>

          {/* Payment History */}
          <Card title="Payment History">
            <Table 
              columns={paymentColumns}
              dataSource={mockPaymentHistory}
              rowKey="id"
              pagination={false}
            />
          </Card>

          {/* Upcoming Payments */}
          <Card title="Upcoming Payments">
            <Table 
              columns={upcomingColumns}
              dataSource={mockUpcomingPayments}
              rowKey="id"
              pagination={false}
            />
          </Card>

          {/* Tax Documents */}
          <Card title="Tax Documents">
            <Table 
              columns={documentColumns}
              dataSource={mockTaxDocuments}
              rowKey="id"
              pagination={false}
            />
          </Card>

          {/* Wallet Information */}
          <Card title="Payment Information">
            <Space direction="vertical">
              <div>
                <Text strong>Payment Address:</Text>
                <div style={{ fontFamily: 'monospace', marginTop: '4px' }}>
                  {mockEmployeeData.address}
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Button type="primary">Update Payment Method</Button>
                <Button style={{ marginLeft: '8px' }}>Update Tax Information</Button>
              </div>
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};