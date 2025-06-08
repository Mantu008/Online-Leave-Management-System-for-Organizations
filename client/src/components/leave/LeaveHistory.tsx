import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getMyLeaves } from '../../services/api';
import { LeaveRequest } from '../../types';
import { Download } from '@mui/icons-material';
import { Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import api from '../../services/api';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const LeaveHistory: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);
  const [leaveBalance, setLeaveBalance] = useState({
    casual: 0,
    sick: 0,
    annual: 0,
  });

  const fetchLeaves = async () => {
    try {
      // Check if user is authenticated
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Please login to view your leave history');
        setLoading(false);
        return;
      }

      const response = await getMyLeaves();
      console.log('Full API Response:', response);
      
      // Check if response and response.data exist
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Handle both array and object responses
      let leavesData;
      if (Array.isArray(response.data)) {
        // If response.data is an array, we need to fetch leave balance separately
        try {
          const userResponse = await api.get('/auth/me');
          const userData = userResponse.data;
          
          leavesData = {
            leaves: response.data,
            leaveBalance: {
              casual: userData.leaveBalance?.casual ?? 10,
              sick: userData.leaveBalance?.sick ?? 10,
              annual: userData.leaveBalance?.annual ?? 20
            }
          };
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          leavesData = {
            leaves: response.data,
            leaveBalance: { casual: 10, sick: 10, annual: 20 }
          };
        }
      } else {
        // If response.data is an object, use it directly
        leavesData = response.data;
      }

      console.log('Processed Data:', leavesData);
      
      // Set leaves with validation
      if (Array.isArray(leavesData.leaves)) {
        setLeaves(leavesData.leaves);
      } else {
        console.error('Invalid leaves data:', leavesData.leaves);
        setLeaves([]);
      }
      
      // Set leave balance with validation
      if (leavesData.leaveBalance && typeof leavesData.leaveBalance === 'object') {
        setLeaveBalance({
          casual: leavesData.leaveBalance.casual ?? 10,
          sick: leavesData.leaveBalance.sick ?? 10,
          annual: leavesData.leaveBalance.annual ?? 20
        });
      } else {
        console.error('Invalid leave balance data:', leavesData.leaveBalance);
        setLeaveBalance({ casual: 10, sick: 10, annual: 20 });
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching leaves:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave history');
      }
      setLoading(false);
      setLeaves([]);
      setLeaveBalance({ casual: 10, sick: 10, annual: 20 });
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const exportToPDF = async () => {
    if (!user || !tableRef.current) return;
    
    try {
      setExporting(true);
      
      const element = tableRef.current;
      const opt = {
        margin: 1,
        filename: 'leave-history.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      } as any;

      // Create a temporary div for the PDF content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="padding: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">Leave History Report</h1>
          <div style="margin-bottom: 20px;">
            <p><strong>Employee:</strong> ${user.name}</p>
            <p><strong>Department:</strong> ${user.department}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          ${element.innerHTML}
          <div style="margin-top: 20px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Leave Balance:</h2>
            <p>Casual: ${leaveBalance?.casual || 0} days</p>
            <p>Sick: ${leaveBalance?.sick || 0} days</p>
            <p>Annual: ${leaveBalance?.annual || 0} days</p>
          </div>
        </div>
      `;

      await html2pdf().set(opt).from(tempDiv).save();
    } catch (err) {
      console.error('PDF Export Error:', err);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={exportToPDF}
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
        >
          {exporting ? 'Exporting...' : 'Export to PDF'}
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Casual Leave</p>
            <p className="text-2xl font-bold text-blue-600">{leaveBalance?.casual || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Sick Leave</p>
            <p className="text-2xl font-bold text-green-600">{leaveBalance?.sick || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Annual Leave</p>
            <p className="text-2xl font-bold text-purple-600">{leaveBalance?.annual || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(leaves || [])
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="input input-sm w-20"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {Math.ceil(leaves.length / rowsPerPage)}
            </span>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= Math.ceil(leaves.length / rowsPerPage) - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory; 