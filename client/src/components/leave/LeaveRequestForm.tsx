import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { format, differenceInDays } from "date-fns";
import { RootState } from "../../store";
import { LeaveRequestData } from "../../types";
import { createLeaveRequest } from "../../services/api";
import { Grid } from "../common/Grid";
import notificationService from "../../services/notificationService";

const leaveTypes = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
];

const validationSchema = Yup.object({
    startDate: Yup.date()
        .required("Start date is required")
        .min(new Date(), "Start date cannot be in the past"),
    endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),
    leaveType: Yup.string()
        .required("Leave type is required")
        .oneOf(["annual", "sick", "casual"], "Invalid leave type"),
    reason: Yup.string()
        .required("Reason is required")
        .min(10, "Reason must be at least 10 characters"),
});

const LeaveRequestForm: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const calculateTotalDays = (startDate: Date, endDate: Date): number => {
        return differenceInDays(endDate, startDate) + 1;
    };

    const handleSubmit = async (values: LeaveRequestData) => {
        try {
            setError(null);
            setIsSubmitting(true);

            const startDate = new Date(values.startDate);
            const endDate = new Date(values.endDate);

            const formattedValues = {
                ...values,
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
                totalDays: calculateTotalDays(startDate, endDate),
            };

            const response = await createLeaveRequest(formattedValues);

            notificationService.emitLeaveRequest({
                employeeId: user?._id,
                employeeName: user?.name,
                department: user?.department,
                leaveRequest: response,
            });

            navigate("/leave/history");
        } catch (err: any) {
            if (err.errors) {
                setError(err.errors.map((e: any) => e.msg).join(", "));
            } else {
                setError(err.message || "Failed to submit leave request");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || !user.leaveBalance) {
        return null;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">
                    Request Leave
                </h1>

                {/* Leave Balance */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Your Leave Balance
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-500">Annual</p>
                            <p className="text-xl font-bold text-gray-900">
                                {user.leaveBalance.annual}
                            </p>
                            <p className="text-xs text-gray-500">days</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-500">Sick</p>
                            <p className="text-xl font-bold text-gray-900">
                                {user.leaveBalance.sick}
                            </p>
                            <p className="text-xs text-gray-500">days</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-500">Casual</p>
                            <p className="text-xl font-bold text-gray-900">
                                {user.leaveBalance.casual}
                            </p>
                            <p className="text-xs text-gray-500">days</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Form */}
                <Formik
                    initialValues={{
                        startDate: "",
                        endDate: "",
                        leaveType: "annual",
                        reason: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, setFieldValue, values }) => {
                        const totalDays =
                            values.startDate && values.endDate
                                ? calculateTotalDays(
                                      new Date(values.startDate),
                                      new Date(values.endDate),
                                  )
                                : 0;

                        return (
                            <Form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Start Date */}
                                    <div>
                                        <label
                                            htmlFor="startDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={values.startDate}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "startDate",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 shadow-sm ${
                                                errors.startDate &&
                                                touched.startDate
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {errors.startDate &&
                                            touched.startDate && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.startDate}
                                                </p>
                                            )}
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label
                                            htmlFor="endDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={values.endDate}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "endDate",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 shadow-sm ${
                                                errors.endDate &&
                                                touched.endDate
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {errors.endDate && touched.endDate && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.endDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Total Days */}
                                {totalDays > 0 && (
                                    <div className="text-sm text-gray-600 bg-gray-50 rounded-md px-4 py-2 inline-block">
                                        Total Days:{" "}
                                        <span className="font-semibold">
                                            {totalDays}
                                        </span>
                                    </div>
                                )}

                                {/* Leave Type */}
                                <div>
                                    <label
                                        htmlFor="leaveType"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Leave Type
                                    </label>
                                    <Field
                                        as="select"
                                        id="leaveType"
                                        name="leaveType"
                                        className={`w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 shadow-sm ${
                                            errors.leaveType &&
                                            touched.leaveType
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    >
                                        {leaveTypes.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </option>
                                        ))}
                                    </Field>
                                    {errors.leaveType && touched.leaveType && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.leaveType}
                                        </p>
                                    )}
                                </div>

                                {/* Reason */}
                                <div>
                                    <label
                                        htmlFor="reason"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Reason
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="reason"
                                        name="reason"
                                        rows={4}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 shadow-sm ${
                                            errors.reason && touched.reason
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.reason && touched.reason && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-60"
                                    >
                                        {isSubmitting
                                            ? "Submitting..."
                                            : "Submit Request"}
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
