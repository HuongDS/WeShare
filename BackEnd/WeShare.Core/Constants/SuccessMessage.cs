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
    }
}
