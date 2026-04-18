using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace WeShare.Core.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum GroupRoleEnum
    {
        Leader,
        Member
    }
}
