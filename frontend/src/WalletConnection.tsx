import React from 'react';
import { useWallet } from './WalletProvider';
import { Button, Typography, Space, Card } from 'antd';

const { Title, Text } = Typography;

export const WalletConnection: React.FC = () => {
  const { account, connected, connect, disconnect } = useWallet();

  if (connected && account) {
    return (
      <Card size="small">
        <Space direction="vertical">
          <Title level={5} style={{ margin: 0 }}>Wallet Connected</Title>
          <Text>{account.address.slice(0, 6)}...{account.address.slice(-4)}</Text>
          <Button onClick={disconnect} type="primary" danger size="small">
            Disconnect
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Card size="small">
      <Space direction="vertical">
        <Title level={5} style={{ margin: 0 }}>Connect Wallet</Title>
        <Button onClick={connect} type="primary" size="small">
          Connect (Mock)
        </Button>
      </Space>
    </Card>
  );
};