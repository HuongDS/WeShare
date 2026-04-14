using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.VietQr;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Exceptions;

namespace WeShare.Application.Services
{
    public class BankServices : IBankServices
    {
        private readonly ICacheServices _cacheServices;
        private readonly IHttpClientFactory _httpClientFactory;

        public BankServices(ICacheServices cacheServices, IHttpClientFactory httpClientFactory)
        {
            _cacheServices = cacheServices;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<List<BankDto>> GetBanksAsync()
        {
            var cacheBanksKey = "vietqr_banks_list";

            var cachedBanks = await _cacheServices.GetAsync(cacheBanksKey);
            if (!string.IsNullOrEmpty(cachedBanks))
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<BankDto>>(cachedBanks);
            }

            var client = _httpClientFactory.CreateClient();
            var res = await client.GetAsync("https://api.vietqr.io/v2/banks");
            if (!res.IsSuccessStatusCode)
            {
                throw new InternalServerError(ErrorMessage.BANK_SYSTEM_IN_UNAVAILABLE);
            }

            var jsonStr = await res.Content.ReadAsStringAsync();
            var options = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var vietqrData = System.Text.Json.JsonSerializer.Deserialize<VietQrResponseDto>(jsonStr, options);

            if (vietqrData?.Data != null)
            {
                var dataToCache = System.Text.Json.JsonSerializer.Serialize(vietqrData.Data);
                // 7 days cache
                await _cacheServices.SetAsync(cacheBanksKey, dataToCache, 10080);
                return vietqrData.Data;
            }

            return new List<BankDto>();
        }
    }
}
