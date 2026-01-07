using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Constants
{
    public class SuccessMessage
    {
        // Auth
        public static string REGISTER_SUCCESSFULLY = "Register Successfully.";
        public static string LOGIN_SUCCESSFULLY = "Login Successfully.";
        public static string REFRESH_SUCCESSFULLY = "Refresh Token Successfully.";
        public static string LOG_OUT_SUCCESSFULLY = "Log Out Successfully.";

        // Group
        public static string GET_GROUP_SUCCESSFULLY = "Get group successful!";
        public static string CREATE_GROUP_SUCCESSFULLY = "Create group successful!";
        public static string ADD_MEMBER_TO_GROUP_SUCCESSFULLY = "Add members to group successful!";
        public static string REMOVE_MEMBER_TO_GROUP_SUCCESSFULLY = "Remove members to group successful!";
        public static string UPDATE_MEMBER_TO_GROUP_SUCCESSFULLY = "Update members to group successful!";
        public static string DELETE_GROUP_SUCCESSFULLY = "Delete group successful!";

        // User
        public static string GET_USER_PROFILE_SUCCESSFULLY = "Get user profile successful!";
        public static string UPDATE_USER_PROFILE_SUCCESSFULLY = "Update user profile successful!";
        public static string UPDATE_PASSWORD_SUCCESSFULLY = "Update password successful!";
        public static string UPDATE_PAYMENT_INFO_SUCCESSFULLY = "Update payment information successful!";

        // Transaction
        public static string ADD_TRANSACTION_SUCCESSFULLY = "Add transaction successful!";
        public static string CHECK_USER_PAYER_OF_TRANSACTION_SUCCESSFULLY = "Check user payer of transaction successfully.";
        public static string DELETE_TRANSACTION_SUCCESSFULLY = "Delete transaction successful!";
        public static string GET_TRANSACTION_DETAIL_SUCCESSFULLY = "Get transaction detail successful!";
        public static string UPDATE_TRANSACTION_SUCCESSFULLY = "Update transaction successful!";
        public static string ADD_SETTLEMENT_SUCCESSFULLY = "Settle successful!";
        public static string ADD_SETTLEMENTS_SUCCESSFULLY = "Settle all successful!";

        // Event
        public static string CREATE_EVENT_SUCCESSFULLY = "Create event successful!";
        public static string GET_EVENT_SUCCESSFULLY = "Get event successful!";
        public static string UPDATE_EVENT_SUCCESSFULLY = "Update event successful!";
        public static string DELETE_EVENT_SUCCESSFULLY = "Delete event successful!";

        // Task
        public static string CREATE_TASK_SUCCESSFULLY = "Create task successful!";
        public static string GET_TASK_SUCCESSFULLY = "Get task successful!";
        public static string GET_TASKS_SUCCESSFULLY = "Get tasks successful!";
        public static string UPDATE_TASK_SUCCESSFULLY = "Update task successful!";
        public static string DELETE_TASK_SUCCESSFULLY = "Delete task successful!";

        // Otp
        public static string SEND_OTP_SUCCESSFULLY = "Send OTP successfully!";
        public static string VERIFY_OTP_SUCCESSFULLY = "Verify OTP successfully!";
    }
}
