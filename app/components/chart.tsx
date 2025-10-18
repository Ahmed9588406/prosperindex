import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: { subject: string; value: number }[];
}

export default function Chart({ data }: ChartProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-[580px] h-[450px] bg-white p-6 rounded-lg shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#666', fontSize: 13, fontFamily: 'Arial, sans-serif' }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#999', fontSize: 11 }}
              tickCount={6}
            />
            <Radar 
              name="Index" 
              dataKey="value" 
              stroke="#00bcd4" 
              fill="#00bcd4" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}