import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  PendingActions as PendingIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
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
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
    <div className="flex items-center mb-4">
      <div className="p-3 rounded-full mr-3 bg-primary-main/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 mb-6">{description}</p>
    <button
      onClick={onClick}
      className="w-full py-2 px-4 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
    >
      {buttonText}
    </button>
  </div>
);

const StatCard: React.FC<{
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = ({ value, label, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  const dashboardItems = [
    {
      title: 'User Management',
      description: 'Manage employees and their roles, departments, and permissions.',
      icon: <PeopleIcon className="text-primary-main" />,
      buttonText: 'Manage Users',
      onClick: () => navigate('/users'),
    },
    {
      title: 'Holiday Management',
      description: 'Configure holidays and special leave days for the organization.',
      icon: <EventIcon className="text-primary-main" />,
      buttonText: 'Manage Holidays',
      onClick: () => navigate('/holidays/manage'),
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences.',
      icon: <SettingsIcon className="text-primary-main" />,
      buttonText: 'View Settings',
      onClick: () => navigate('/settings'),
    },
    {
      title: 'Reports',
      description: 'View and generate reports on leave statistics and trends.',
      icon: <AssessmentIcon className="text-primary-main" />,
      buttonText: 'View Reports',
      onClick: () => navigate('/reports'),
    },
  ];

  const stats = [
    {
      value: 150,
      label: 'Total Employees',
      icon: <GroupIcon className="text-blue-500" />,
      color: 'bg-blue-100',
    },
    {
      value: 25,
      label: 'Pending Requests',
      icon: <PendingIcon className="text-orange-500" />,
      color: 'bg-orange-100',
    },
    {
      value: 8,
      label: 'Departments',
      icon: <BusinessIcon className="text-green-500" />,
      color: 'bg-green-100',
    },
    {
      value: 12,
      label: 'Holidays This Month',
      icon: <CalendarIcon className="text-purple-500" />,
      color: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-main to-primary-dark text-white p-8 rounded-xl mb-6">
          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-white/90">
            System Administrator
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 