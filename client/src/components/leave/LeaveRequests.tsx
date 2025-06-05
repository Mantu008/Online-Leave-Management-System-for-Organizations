import React, { useEffect, useState } from 'react';
import { LeaveRequest } from '../../types';
import { getLeaveRequests, updateLeaveRequest } from '../../services/api';
import notificationService from '../../services/notificationService';

interface ActionDialogProps {
  open: boolean;
  leaveRequest: LeaveRequest | null;
  onClose: () => void;
  onSubmit: (status: 'approved' | 'rejected', comment?: string) => void;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  leaveRequest,
  onClose,
  onSubmit,
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (status: 'approved' | 'rejected') => {
    onSubmit(status, comment);
    setComment('');
  };

  if (!leaveRequest) return null;

  return (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Review Leave Request
          </h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-gray-900">
              <span className="font-semibold">Employee:</span> {leaveRequest.employee.name}
            </p>
          </div>
          <div>
            <p className="text-gray-900">
              <span className="font-semibold">Leave Type:</span> {leaveRequest.leaveType}
            </p>
          </div>
          <div>
            <p className="text-gray-900">
              <span className="font-semibold">Duration:</span>{' '}
              {`${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(
                leaveRequest.endDate
              ).toLocaleDateString()}`}
            </p>
          </div>
          <div>
            <p className="text-gray-900">
              <span className="font-semibold">Reason:</span> {leaveRequest.reason}
            </p>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input w-full"
              rows={3}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('rejected')}
            className="btn btn-error"
          >
            Reject
          </button>
          <button
            onClick={() => handleSubmit('approved')}
            className="btn btn-success"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await getLeaveRequests();
      setRequests(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leave requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (status: 'approved' | 'rejected', comment?: string) => {
    if (!selectedRequest) return;

    try {
      const updatedRequest = await updateLeaveRequest(selectedRequest._id, status);
      setDialogOpen(false);
      setSelectedRequest(null);
      
      // Emit leave request status update notification
      notificationService.emitLeaveRequest({
        employeeId: selectedRequest.employee._id,
        employeeName: selectedRequest.employee.name,
        department: selectedRequest.employee.department,
        status: status,
        leaveType: selectedRequest.leaveType,
        startDate: selectedRequest.startDate,
        endDate: selectedRequest.endDate,
        comment: comment
      });
      
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError('Failed to update leave request');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.leaveType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ActionDialog
        open={dialogOpen}
        leaveRequest={selectedRequest}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleAction}
      />
    </div>
  );
};

export default LeaveRequests; 