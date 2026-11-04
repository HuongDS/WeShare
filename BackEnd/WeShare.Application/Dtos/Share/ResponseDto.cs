namespace WeShare.Core.Dtos.Share
{
    public class ResponseDto<T>
    {
        public T? Data { get; set; }
        public int Status { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
