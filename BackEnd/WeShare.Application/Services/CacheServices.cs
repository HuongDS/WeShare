using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StackExchange.Redis;
using WeShare.Application.Interfaces;

namespace WeShare.Application.Services
{
    public class CacheServices : ICacheServices
    {
        private IDatabase _dbRedis;

        public CacheServices(ConnectionMultiplexer redis)
        {
            _dbRedis = redis.GetDatabase();
        }

        public async Task SetAsync(string toEmail, string value, int expireMins)
        {
            var key = $"email:{toEmail}";
            await _dbRedis.StringSetAsync(key, value, TimeSpan.FromMinutes(expireMins));
        }

        public async Task<string> GetAsync(string email)
        {
            var key = $"email:{email}";
            var value = await _dbRedis.StringGetAsync(key);
            return value;
        }

        public async Task RemoveAsync(string email)
        {
            var key = $"email:{email}";
            await _dbRedis.KeyDeleteAsync(key);
        }
    }
}
