import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getMyLeaves } from '../../services/api';
import { LeaveRequest } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from '@mui/icons-material';
import { Button, CircularProgress, Alert } from '@mui/material';

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

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await getMyLeaves();
      setLeaves(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leave history');
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!user) return;
    
    try {
      setExporting(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Leave History Report', 14, 15);
      
      // Add user info
      doc.setFontSize(12);
      doc.text(`Employee: ${user.name}`, 14, 25);
      doc.text(`Department: ${user.department}`, 14, 32);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 39);

      // Add table
      const tableData = leaves.map(leave => [
        new Date(leave.startDate).toLocaleDateString(),
        new Date(leave.endDate).toLocaleDateString(),
        leave.leaveType,
        leave.totalDays.toString(),
        leave.status,
        leave.reason || '-'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Start Date', 'End Date', 'Type', 'Days', 'Status', 'Reason']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Add leave balance
      const finalY = (doc as any).lastAutoTable.finalY || 45;
      doc.setFontSize(12);
      doc.text('Leave Balance:', 14, finalY + 10);
      doc.text(`Annual: ${user.leaveBalance.annual} days`, 14, finalY + 17);
      doc.text(`Sick: ${user.leaveBalance.sick} days`, 14, finalY + 24);
      doc.text(`Casual: ${user.leaveBalance.casual} days`, 14, finalY + 31);

      // Save the PDF
      doc.save('leave-history.pdf');
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Leave History</h1>
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

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.createdAt).toLocaleDateString()}
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