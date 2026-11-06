using System;
using System.Collections.Generic;

namespace WeShare.Application.Dtos.User
{
    public class GlobalSearchResultDto
    {
        public List<SearchGroupResultItemDto> Groups { get; set; } = new();
        public List<SearchEventResultItemDto> Events { get; set; } = new();
        public List<SearchTaskResultItemDto> Tasks { get; set; } = new();
        public List<SearchExpenseResultItemDto> Expenses { get; set; } = new();
        public List<SearchMemberResultItemDto> Members { get; set; } = new();
    }

    public class SearchGroupResultItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int MemberCount { get; set; }
    }

    public class SearchEventResultItemDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
        public DateTime? EventDate { get; set; }
    }

    public class SearchTaskResultItemDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? DueAt { get; set; }
    }

    public class SearchExpenseResultItemDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PayerName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class SearchMemberResultItemDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public int GroupId { get; set; }
    }
}
