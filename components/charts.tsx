import React, { useState, useEffect } from 'react';

interface CPIGaugeProps {
  value: number; // 0-100
  width?: number;
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const CPIGauge: React.FC<CPIGaugeProps> = ({ 
  value, 
  width = 300, 
  height = 550,
  showLabels = true,
  animated = true,
  size = 'medium'
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    let animationFrame: NodeJS.Timeout;
    let currentValue = 0;
    const step = value / 30;

    const animate = () => {
      if (currentValue < value) {
        currentValue += step;
        setDisplayValue(Math.min(currentValue, value));
        animationFrame = setTimeout(animate, 16);
      }
    };

    animate();
    return () => clearTimeout(animationFrame);
  }, [value, animated]);

  const categories = [
    { label: 'VERY SOLID', min: 80, max: 100, color: '#10b981', bgColor: '#10b981', borderColor: '#059669' },
    { label: 'SOLID', min: 70, max: 80, color: '#22c55e', bgColor: '#22c55e', borderColor: '#16a34a' },
    { label: 'MODERATELY SOLID', min: 60, max: 70, color: '#84cc16', bgColor: '#84cc16', borderColor: '#65a30d' },
    { label: 'MODERATELY WEAK', min: 50, max: 60, color: '#eab308', bgColor: '#eab308', borderColor: '#ca8a04' },
    { label: 'WEAK', min: 40, max: 50, color: '#f97316', bgColor: '#f97316', borderColor: '#ea580c' },
    { label: 'VERY WEAK', min: 0, max: 40, color: '#ef4444', bgColor: '#ef4444', borderColor: '#dc2626' },
  ];

  const getColor = (cpi: number): string => {
    const category = categories.find(cat => cpi >= cat.min && cpi < cat.max);
    return category?.color || '#ef4444';
  };

  const getCategory = (cpi: number): string => {
    const category = categories.find(cat => cpi >= cat.min && cpi < cat.max);
    return category?.label || 'VERY WEAK';
  };

  const getCategoryColors = (cpi: number) => {
    const category = categories.find(cat => cpi >= cat.min && cpi < cat.max);
    return {
      color: category?.color || '#ef4444',
      bgColor: category?.bgColor || '#ef4444',
      borderColor: category?.borderColor || '#dc2626'
    };
  };

  const barWidth = 50;
  const barHeight = height - 100;
  const leftMargin = showLabels ? 150 : 60;
  const fontSize = size === 'small' ? 10 : size === 'large' ? 13 : 11;

  const indicatorY = 50 + (barHeight * (100 - displayValue) / 100);
  const colors = getCategoryColors(displayValue);

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: `${width}px` }}>
      <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Vertical Gradient matching the image */}
          <linearGradient id={`cpiGradient-${value}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="20%" stopColor="#f97316" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#84cc16" />
            <stop offset="70%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Gradient Bar */}
        <rect 
          x={leftMargin} 
          y={50} 
          width={barWidth} 
          height={barHeight} 
          fill={`url(#cpiGradient-${value})`}
          rx="4"
        />

        {/* Left bracket */}
        <line 
          x1={leftMargin - 5} 
          y1={50} 
          x2={leftMargin - 5} 
          y2={50 + barHeight} 
          stroke="#1f2937" 
          strokeWidth="2"
        />
        <line 
          x1={leftMargin - 10} 
          y1={50} 
          x2={leftMargin - 5} 
          y2={50} 
          stroke="#1f2937" 
          strokeWidth="2"
        />
        <line 
          x1={leftMargin - 10} 
          y1={50 + barHeight} 
          x2={leftMargin - 5} 
          y2={50 + barHeight} 
          stroke="#1f2937" 
          strokeWidth="2"
        />

        {/* Category labels on the left */}
        {showLabels && categories.map((cat, idx) => {
          const yStart = 50 + (barHeight * (100 - cat.max) / 100);
          const yEnd = 50 + (barHeight * (100 - cat.min) / 100);
          const yMid = (yStart + yEnd) / 2;
          
          return (
            <g key={idx}>
              {/* Horizontal line at category boundary */}
              <line 
                x1={leftMargin - 15} 
                y1={yStart} 
                x2={leftMargin} 
                y2={yStart} 
                stroke="#6b7280" 
                strokeWidth="1"
              />
              {/* Category label */}
              <text 
                x={leftMargin - 20} 
                y={yMid + 4} 
                textAnchor="end" 
                fontSize={fontSize}
                fontWeight="600"
                fill="#1f2937"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {cat.label}
              </text>
            </g>
          );
        })}

        {/* Right side CPI scale */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
          const y = 50 + (barHeight * (100 - tick) / 100);
          const isMajor = tick % 10 === 0;
          
          return (
            <g key={tick}>
              <line 
                x1={leftMargin + barWidth} 
                y1={y} 
                x2={leftMargin + barWidth + 8} 
                y2={y} 
                stroke="#6b7280"
                strokeWidth="1"
              />
              {isMajor && (
                <text 
                  x={leftMargin + barWidth + 15} 
                  y={y + 4} 
                  fontSize={fontSize - 1}
                  fill="#4b5563"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="400"
                >
                  {tick} CPI
                </text>
              )}
            </g>
          );
        })}

        {/* Current value indicator line */}
        {displayValue >= 0 && displayValue <= 100 && (
          <>
            <line 
              x1={leftMargin - 15} 
              y1={indicatorY} 
              x2={leftMargin + barWidth + 8} 
              y2={indicatorY} 
              stroke={getColor(displayValue)} 
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          </>
        )}

        {/* Top label "100 CPI" */}
        <text 
          x={leftMargin + barWidth + 15} 
          y={45} 
          fontSize={fontSize}
          fill="#1f2937"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
        >
          100 CPI
        </text>

        {/* Bottom label "0 CPI" */}
        <text 
          x={leftMargin + barWidth + 15} 
          y={50 + barHeight + 5} 
          fontSize={fontSize}
          fill="#1f2937"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
        >
          0 CPI
        </text>
      </svg>

      {/* Value display box below with modern border */}
      <div 
        style={{
          marginTop: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ 
          fontSize: '36px', 
          fontWeight: '800', 
          color: colors.color,
          marginBottom: '8px',
          textShadow: `0 2px 10px ${colors.color}40`
        }}>
          {Math.round(displayValue)}
        </div>
        <div 
          style={{ 
            display: 'inline-block',
            padding: '8px 20px',
            fontSize: '12px', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#ffffff',
            background: `linear-gradient(135deg, ${colors.bgColor}, ${colors.borderColor})`,
            borderRadius: '8px',
            border: `2px solid ${colors.borderColor}`,
            boxShadow: `
              0 4px 15px ${colors.color}30,
              0 0 0 1px ${colors.borderColor}20,
              inset 0 1px 0 rgba(255,255,255,0.2)
            `,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>
            {getCategory(displayValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CPIGauge;