import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ModernChartProps {
  data: ChartData[];
  type?: 'area' | 'bar' | 'pie';
  height?: number;
  gradient?: boolean;
  title?: string;
  subtitle?: string;
}

const GRADIENT_COLORS = [
  '#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
];

export const ModernChart: React.FC<ModernChartProps> = ({
  data,
  type = 'area',
  height = 300,
  gradient = true,
  title,
  subtitle
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-white/10">
          <p className="text-gray-300 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill={gradient ? "url(#areaGradient)" : "#6366f1"}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            No chart data available
          </div>
        );
    }
  };

  return (
    <motion.div
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
};

export const PayrollInsightsChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ModernChart
      data={data}
      type="area"
      height={350}
      title="Payroll Insights"
      subtitle="Monthly payment trends and projections"
      gradient
    />
  );
};

export const DepartmentSpendingChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ModernChart
      data={data}
      type="pie"
      height={300}
      title="Department Spending"
      subtitle="Budget allocation by department"
    />
  );
};