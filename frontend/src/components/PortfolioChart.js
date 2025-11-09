import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

function PortfolioChart({ portfolio, name }) {
  const data = Object.entries(portfolio).map(([asset, weight]) => ({
    name: asset,
    value: weight
  }));

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>{name}</h3>
      <div className="grid grid-cols-2">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Asset</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Weight %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: COLORS[idx % COLORS.length],
                      marginRight: '8px',
                      borderRadius: '2px'
                    }}></span>
                    {item.name}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                    {item.value}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PortfolioChart;

