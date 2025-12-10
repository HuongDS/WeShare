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

        // GroupMember
        public static string GROUP_MEMBER_NOT_FOUND = "Group member not found! Please try again.";
    }
}
