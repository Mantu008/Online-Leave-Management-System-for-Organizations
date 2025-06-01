import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  EventNote,
  History,
  CalendarMonth,
  EmojiEvents,
  LocalHospital,
  BeachAccess,
} from '@mui/icons-material';
import { RootState } from '../../store';

const LeaveBalanceCard: React.FC<{ type: string; days: number; icon: React.ReactNode; color: string }> = ({ type, days, icon, color }) => {
  const maxDays = type === 'annual' ? 20 : type === 'sick' ? 10 : 5;
  const percentage = (days / maxDays) * 100;

  return (
    <div className="card hover:transform hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-full mr-3 bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold">
          {type.charAt(0).toUpperCase() + type.slice(1)} Leave
        </h3>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold">{days}</span>
        <span className="text-sm text-gray-500 ml-2">days</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-sm text-gray-500">
        {maxDays - days} days remaining
      </p>
    </div>
  );
};

const QuickActionButton: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  variant?: 'contained' | 'outlined';
}> = ({ title, icon, onClick, variant = 'contained' }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
      variant === 'contained'
        ? 'bg-primary-main text-white hover:bg-primary-dark'
        : 'border-2 border-primary-main text-primary-main hover:bg-primary-main hover:text-white'
    }`}
  >
    {icon}
    <span>{title}</span>
  </button>
);

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  const leaveBalance = user.leaveBalance || {
    annual: 0,
    sick: 0,
    casual: 0
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-main to-primary-dark text-white p-8 rounded-xl mb-6">
          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-white/90">
            {user.department} Department
          </p>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LeaveBalanceCard 
            type="annual" 
            days={leaveBalance.annual} 
            icon={<BeachAccess className="text-primary-main" />}
            color="#1976d2"
          />
          <LeaveBalanceCard 
            type="sick" 
            days={leaveBalance.sick} 
            icon={<LocalHospital className="text-red-500" />}
            color="#ef4444"
          />
          <LeaveBalanceCard 
            type="casual" 
            days={leaveBalance.casual} 
            icon={<EmojiEvents className="text-secondary-main" />}
            color="#9c27b0"
          />
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              title="Request Leave"
              icon={<EventNote />}
              onClick={() => navigate('/leave/apply')}
            />
            <QuickActionButton
              title="View Leave History"
              icon={<History />}
              onClick={() => navigate('/leave/history')}
              variant="outlined"
            />
            <QuickActionButton
              title="View Holidays"
              icon={<CalendarMonth />}
              onClick={() => navigate('/holidays')}
              variant="outlined"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 