using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Constants
{
    public static class ErrorMessage
    {
        // 
        public static string SOME_THING_WENT_WRONG = "Something went wrong. Please try again!";

        // Auth
        public static string USER_HAS_BEEN_EXIST = "User exist!";
        public static string EMAIL_OR_PASSWORD_IS_INCORRECT = "Email or password is incorrect!";
        public static string PASSWORD_IS_WEAK = "Password is very weak!";
        public static string EMAIL_INVALID = "Please input valid email!";
        public static string TOKEN_INVALID = "Token is not exist or invalid!";
        public static string TOKEN_IS_REVOKED = "Token is revoked!";
        public static string TOKEN_IS_EXPIRED = "Token is expired!";
        public static string ALERT_INVALID_LOGIN = "Anomalous access detected. Please log in again.";
        public static string USER_NOT_FOUND = "User not found! PLease try again.";
        public static string LOGIN_FAILED = "Login Failed! PLease try again.";
        public static string LOG_OUT_FAILED = "Logout Failed! PLease try again.";
        public static string REGISTER_FAILED = "Register Failed! PLease try again.";
        public static string OTP_IS_INVALID = "OTP is invalid! Please try again.";

        // Group
        public static string GROUP_NOT_FOUND = "Group not found! Please try again.";
        public static string YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION = "You have no right to this action!";

        // User
        public static string USER_PROFILE_NOT_FOUND = "User profile not found! Please try again.";
        public static string UNAUTHORIZED_ACTION = "You are not authorized to perform this action!";

        // TransactionSplit
        public static string OWED_AMOUNT_CANNOT_BE_NEGATIVE = "Owed amount cannot be negative!";
        public static string TRANSACTION_SPLIT_NOT_FOUND = "Transaction split not found! Please try again.";
        public static string DEBTOR_NOT_FOUND = "Debtor not found! Please try again.";
        public static string SPLIT_AMOUNT_CANNOT_BE_NULL = "You must provide split amounts.";
        public static string INSUFFICIENT_AMOUNT_TO_PAY = "Insufficient amount to pay! Please try again.";
        public static string TRANSACTION_SPLIT_ALREADY_PAID = "This transaction split has already been paid.";
        public static string TOTAL_FROM_SPLITS_MUST_BE_EQUAL_TO_TOTAL_AMOUNT = "Total from splits must be equal to total amount.";
        public static string TOTAL_FROM_SPLITS_PERCENTAGE_MUST_BE_EQUAL_TO_TOTAL_AMOUNT = "Total from splits percentage must be equal to 100%";

        // Transaction
        public static string TRANSACTION_NOT_FOUND = "Transaction not found! Please try again.";
        public static string PAYER_NOT_FOUND = "Payer not found! Please try again.";
        public static string DEBTOR_EMPTY = "Debtor Ids cannot be empty! Please try again.";
        public static string TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO = "Total amount must be greater than zero.";
        public static string TRANSACTION_IS_PENDING = "Transaction is still pending. Please complete it before updating.";
        public static string TRANSACTION_IS_PENDING_CANNOT_BE_DELETED = "Transaction is still pending can not be deleted.";
        public static string YOU_MUST_PROVIDE_EVIDENCE = "You must provide a evidence that you paid.";
        public static string THIS_TRANSACTION_HAS_TYPE_EXPENSE = "This transaction has type expense !";

        // GroupMember
        public static string GROUP_MEMBER_NOT_FOUND = "Group member not found! Please try again.";
        public static string INSUFFICIENT_BALANCE = "Insufficient balance to perform this action!";

        // Event
        public static string EVENT_NOT_FOUND = "Event not found! Please try again.";

        // TaskMember
        public static string TASK_MEMBER_NOT_FOUND = "Task member not found! Please try again.";

        // Task
        public static string TASK_NOT_FOUND = "Task not found! Please try again.";

        // Email
        public static string EMAIL_SEND_FAILED = "Email sending failed! Please try again.";
        public static string EMAIL_TEMPLATE_NOT_FOUND = "Email template not found! Please try again.";
    }
}
