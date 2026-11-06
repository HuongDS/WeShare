namespace WeShare.Core.Exceptions;

public sealed class BusinessException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }
    public BusinessException(int statusCode, string code, string message) : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}
