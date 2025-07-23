import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Productivity Bar Chart Component
export const ProductivityBarChart = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="productivity" 
            fill="#3b82f6" 
            name="Productivity Score"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Task Status Pie Chart Component
export const TaskStatusPieChart = ({ data, title }) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Productivity Trend Line Chart Component
export const ProductivityTrendChart = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: '#374151' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value}%`, 'Productivity']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="productivity" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            name="Productivity Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Work Hours vs Productivity Scatter Chart Component
export const WorkHoursProductivityChart = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis 
            yAxisId="hours"
            orientation="left"
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis 
            yAxisId="productivity"
            orientation="right"
            fontSize={12}
            tick={{ fill: '#374151' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            yAxisId="hours"
            dataKey="workHours" 
            fill="#10b981" 
            name="Work Hours"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="productivity"
            dataKey="productivity" 
            fill="#3b82f6" 
            name="Productivity %"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Team Performance Comparison Component
export const TeamPerformanceChart = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            domain={[0, 100]}
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            fontSize={12}
            tick={{ fill: '#374151' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value}%`, 'Productivity']}
          />
          <Legend />
          <Bar 
            dataKey="productivity" 
            fill="#3b82f6" 
            name="Productivity Score"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Summary Statistics Component
export const SummaryStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Average Productivity</p>
            <p className="text-3xl font-bold">{stats.avgProductivity}%</p>
          </div>
          <div className="text-4xl opacity-80">📊</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Total Tasks</p>
            <p className="text-3xl font-bold">{stats.totalTasks}</p>
          </div>
          <div className="text-4xl opacity-80">✅</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100">Work Hours</p>
            <p className="text-3xl font-bold">{stats.totalHours}h</p>
          </div>
          <div className="text-4xl opacity-80">⏰</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100">Team Size</p>
            <p className="text-3xl font-bold">{stats.teamSize}</p>
          </div>
          <div className="text-4xl opacity-80">👥</div>
        </div>
      </div>
    </div>
  );
};
