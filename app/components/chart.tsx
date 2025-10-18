import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: { subject: string; value: number }[];
}

export default function Chart({ data }: ChartProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm mb-8">
      <ResponsiveContainer width="100%" height={450}>
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
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}