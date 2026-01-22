import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://online-leave-management-system-for.vercel.app/api';


// Get auth token
const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

// Admin statistics
export const getAdminDetailedStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/admin/stats/detailed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin detailed stats:', error);
    throw error;
  }
};

// Manager statistics
export const getManagerStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/leaves/manager/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    throw error;
  }
};

// Employee statistics
export const getEmployeeStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/leaves/employee/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    throw error;
  }
};

// Admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};
