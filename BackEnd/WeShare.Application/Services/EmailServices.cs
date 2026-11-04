using System;
using System.IO;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using WeShare.Application.Interfaces;

namespace WeShare.Application.Services
{
    public class EmailServices : IEmailServices
    {
        private readonly string _mail;
        private readonly string _displayName;
        private readonly string _password;
        private readonly string _host;
        private readonly string _port;

        public EmailServices(IConfiguration configuration)
        {
            _mail = configuration["MailSettings:Mail"] ?? "no-reply@weshare.app";
            _displayName = configuration["MailSettings:DisplayName"] ?? "WeShare";
            _password = configuration["MailSettings:Password"] ?? string.Empty;
            _host = configuration["MailSettings:Host"] ?? "smtp.gmail.com";
            _port = configuration["MailSettings:Port"] ?? "587";
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(_displayName, _mail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlContent
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                await smtp.ConnectAsync(_host, int.Parse(_port), MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_mail, _password);
                await smtp.SendAsync(email);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }
    }
}
