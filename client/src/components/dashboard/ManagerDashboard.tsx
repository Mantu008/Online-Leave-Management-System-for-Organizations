import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { LeaveRequest } from '../../types';
import { getLeaveRequests } from '../../services/api';
import { Grid } from '../common/Grid';
import { EventNote, History, CalendarMonth, People } from '@mui/icons-material';

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

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const requests = await getLeaveRequests();
        setPendingRequests(requests.filter(req => req.status === 'pending'));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pending requests');
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  if (!user) {
    return null;
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
            {user.department} Department Manager
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Pending Leave Requests
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 5).map((request) => (
                    <div key={request._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.leaveType} Leave Request
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            From: {new Date(request.startDate).toLocaleDateString()} To: {new Date(
                              request.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/leave/requests')}
                          className="px-4 py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 5 && (
                    <button
                      onClick={() => navigate('/leave/requests')}
                      className="w-full py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                    >
                      View All Requests →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <QuickActionButton
                title="Manage Leave Requests"
                icon={<EventNote />}
                onClick={() => navigate('/leave/requests')}
              />
              <QuickActionButton
                title="View Team Calendar"
                icon={<People />}
                onClick={() => navigate('/team')}
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
    </div>
  );
};

export default ManagerDashboard; 