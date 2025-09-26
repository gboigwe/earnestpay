import React from 'react';
import { Card, Tag, Typography, Button, Space } from 'antd';
import { StarOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Strategy {
  id: string;
  name: string;
  description: string;
  creator: string;
  riskLevel: number;
  performanceFeeBps: number;
  isActive: boolean;
  createdAt: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  onCopy?: (strategyId: string) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onCopy }) => {
  const getRiskColor = (level: number) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      case 5: return 'purple';
      default: return 'default';
    }
  };

  const getRiskText = (level: number) => {
    const risks = ['', 'Conservative', 'Moderate', 'Balanced', 'Aggressive', 'High Risk'];
    return risks[level] || 'Unknown';
  };

  return (
    <Card
      style={{ marginBottom: 16 }}
      actions={[
        <Button 
          type="primary" 
          icon={<StarOutlined />}
          onClick={() => onCopy?.(strategy.id)}
        >
          Copy Strategy
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{strategy.name}</Title>
          <Tag color={strategy.isActive ? 'green' : 'red'}>
            {strategy.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </div>
        
        <Text type="secondary">{strategy.description}</Text>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color={getRiskColor(strategy.riskLevel)}>
            Risk: {getRiskText(strategy.riskLevel)}
          </Tag>
          <Tag icon={<TrophyOutlined />}>
            Fee: {(strategy.performanceFeeBps / 100).toFixed(1)}%
          </Tag>
        </div>
        
        <Space>
          <Text type="secondary">Created by:</Text>
          <Text code>{strategy.creator.slice(0, 6)}...{strategy.creator.slice(-4)}</Text>
        </Space>
      </Space>
    </Card>
  );
};