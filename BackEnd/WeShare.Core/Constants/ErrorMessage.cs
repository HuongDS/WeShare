using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Constants
{
    public static class ErrorMessage
    {
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
    }
}
