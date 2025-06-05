import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { format, differenceInDays } from 'date-fns';
import { RootState } from '../../store';
import { LeaveRequestData } from '../../types';
import { createLeaveRequest } from '../../services/api';
import { Grid } from '../common/Grid';
import notificationService from '../../services/notificationService';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
];

const validationSchema = Yup.object({
  startDate: Yup.date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  leaveType: Yup.string()
    .required('Leave type is required')
    .oneOf(['annual', 'sick', 'casual'], 'Invalid leave type'),
  reason: Yup.string()
    .required('Reason is required')
    .min(10, 'Reason must be at least 10 characters'),
});

const LeaveRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const calculateTotalDays = (startDate: Date, endDate: Date): number => {
    return differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates
  };

  const handleSubmit = async (values: LeaveRequestData) => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      
      // Format dates as YYYY-MM-DD and calculate total days
      const formattedValues = {
        ...values,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalDays: calculateTotalDays(startDate, endDate),
      };
      
      const response = await createLeaveRequest(formattedValues);
      
      // Emit socket event for leave request submission
      notificationService.emitLeaveRequest({
        employeeId: user?._id,
        employeeName: user?.name,
        department: user?.department,
        leaveRequest: response
      });
      
      navigate('/leave/history');
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors.map((e: any) => e.msg).join(', '));
      } else {
        setError(err.message || 'Failed to submit leave request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Request Leave
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Leave Balance:
          </h2>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <p className="text-gray-600">
                Annual: {user.leaveBalance.annual} days
              </p>
            </Grid>
            <Grid item xs={4}>
              <p className="text-gray-600">
                Sick: {user.leaveBalance.sick} days
              </p>
            </Grid>
            <Grid item xs={4}>
              <p className="text-gray-600">
                Casual: {user.leaveBalance.casual} days
              </p>
            </Grid>
          </Grid>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Formik
          initialValues={{
            startDate: '',
            endDate: '',
            leaveType: 'annual',
            reason: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => {
            // Calculate and display total days when both dates are selected
            const totalDays = values.startDate && values.endDate
              ? calculateTotalDays(new Date(values.startDate), new Date(values.endDate))
              : 0;

            return (
              <Form className="space-y-6">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={values.startDate}
                        onChange={(e) => setFieldValue('startDate', e.target.value)}
                        className={`input ${errors.startDate && touched.startDate ? 'border-red-500' : ''}`}
                      />
                      {errors.startDate && touched.startDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={values.endDate}
                        onChange={(e) => setFieldValue('endDate', e.target.value)}
                        className={`input ${errors.endDate && touched.endDate ? 'border-red-500' : ''}`}
                      />
                      {errors.endDate && touched.endDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                      )}
                    </div>
                  </Grid>
                </Grid>

                {totalDays > 0 && (
                  <p className="text-sm text-gray-500">
                    Total Days: {totalDays}
                  </p>
                )}

                <div>
                  <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type
                  </label>
                  <Field
                    as="select"
                    id="leaveType"
                    name="leaveType"
                    className={`input ${errors.leaveType && touched.leaveType ? 'border-red-500' : ''}`}
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Field>
                  {errors.leaveType && touched.leaveType && (
                    <p className="mt-1 text-sm text-red-500">{errors.leaveType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <Field
                    as="textarea"
                    id="reason"
                    name="reason"
                    rows={4}
                    className={`input ${errors.reason && touched.reason ? 'border-red-500' : ''}`}
                  />
                  {errors.reason && touched.reason && (
                    <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default LeaveRequestForm; 