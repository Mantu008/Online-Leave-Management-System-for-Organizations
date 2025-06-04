import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  departments: number;
  holidaysThisMonth: number;
  userRoles: {
    employee: number;
    manager: number;
    admin: number;
  };
}

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.response?.data?.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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

  const statCards = stats ? [
    {
      value: stats.totalUsers,
      label: 'Total Employees',
      icon: <GroupIcon className="text-blue-500" />,
      color: 'bg-blue-100',
    },
    {
      value: stats.pendingRequests,
      label: 'Pending Requests',
      icon: <PendingIcon className="text-orange-500" />,
      color: 'bg-orange-100',
    },
    {
      value: stats.departments,
      label: 'Departments',
      icon: <BusinessIcon className="text-green-500" />,
      color: 'bg-green-100',
    },
    {
      value: stats.holidaysThisMonth,
      label: 'Holidays This Month',
      icon: <CalendarIcon className="text-purple-500" />,
      color: 'bg-purple-100',
    },
  ] : [];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">Loading dashboard statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

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
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* User Role Distribution */}
        {stats?.userRoles && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-blue-600">{stats.userRoles.employee}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-green-600">{stats.userRoles.manager}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.userRoles.admin}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 