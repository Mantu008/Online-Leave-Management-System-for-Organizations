import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,  
  Legend,
  ChartType
} from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
  totalUsers: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  totalHolidays: number;
}

interface UserStats {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalHolidays: 0,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/user-stats`);
        setUserStats({
          labels: response.data.labels,
          datasets: [
            {
              label: 'Users by Role',
              data: response.data.data,
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(75, 192, 192, 0.6)',
              ],
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
    fetchUserStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Leave Requests</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalLeaves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Pending Leaves</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Approved Leaves</h3>
          <p className="text-3xl font-bold text-green-600">{stats.approvedLeaves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Rejected Leaves</h3>
          <p className="text-3xl font-bold text-red-600">{stats.rejectedLeaves}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Holidays</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalHolidays}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Users by Role</h3>
          <Bar
            type="bar"
            data={userStats}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 