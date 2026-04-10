using System.Net;
using System.Text.Json;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Exceptions;

namespace WeShare.API.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            int statusCode = (int)HttpStatusCode.InternalServerError;
            string message = ErrorMessage.INTERNAL_SERVER_ERROR;

            if (exception is BadRequestException badRequestException)
            {
                statusCode = (int)HttpStatusCode.BadRequest;
                message = badRequestException.Message;
            }
            else if (exception is NotFoundException notFoundException)
            {
                statusCode = (int)HttpStatusCode.NotFound;
                message = notFoundException.Message;
            }
            else if (exception is UnauthorizedException unauthorizedException)
            {
                statusCode = (int)HttpStatusCode.Unauthorized;
                message = unauthorizedException.Message;
            }

            context.Response.StatusCode = statusCode;

            var response = new ResponseDto<object>
            {
                Status = statusCode,
                Message = message,
                Data = null
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var result = JsonSerializer.Serialize(response, options);
            return context.Response.WriteAsync(result);
        }
    }
}
