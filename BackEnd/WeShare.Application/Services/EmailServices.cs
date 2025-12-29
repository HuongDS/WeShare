using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using WeShare.Application.Interfaces;

namespace WeShare.Application.Services
{
    public class EmailServices : IEmailServices
    {
        private string? _mail;
        private string? _displayName;
        private string? _password;
        private string? _host;
        private string? _port;

        public EmailServices(IConfiguration configuration)
        {
            _mail = configuration["MailSettings:Username"];
            _displayName = configuration["MailSettings:DisplayName"];
            _password = configuration["MailSettings:Password"];
            _host = configuration["MailSettings:Host"];
            _port = configuration["MailSettings:Port"];
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var email = new MimeMessage(); // This is content of the email

            email.From.Add(new MailboxAddress(_displayName, _mail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            // Body (HTML)
            var builder = new BodyBuilder();
            builder.HtmlBody = htmlContent;
            email.Body = builder.ToMessageBody();

            // SMTP Client (role like a post in real life to send the mail)
            using var smtp = new SmtpClient();
            try
            {
                // connect to server
                await smtp.ConnectAsync(_host, int.Parse(_port), MailKit.Security.SecureSocketOptions.StartTls);
                // login
                await smtp.AuthenticateAsync(_mail, _password);
                await smtp.SendAsync(email);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }
    }
}
