import React from 'react';
import { SvgIconComponent } from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactElement<SvgIconComponent>;
  buttonText: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
}) => (
  <div className="card h-full flex flex-col">
    <div className="flex-grow p-6">
      <div className="flex items-center mb-4">
        <div className="text-primary-main">
          {icon}
        </div>
        <h2 className="ml-2 text-xl font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
    <div className="p-4 border-t border-gray-100">
      <button
        onClick={onClick}
        className="btn btn-primary text-sm"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

export default DashboardCard; 