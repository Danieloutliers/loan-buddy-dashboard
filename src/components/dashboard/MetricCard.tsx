
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-xs font-medium ${
                  trend.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
