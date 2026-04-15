using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.Cloudinary
{
    public class ImageUploadResult
    {
        public string PublicId { get; set; }
        public string Url { get; set; }
    }
}
