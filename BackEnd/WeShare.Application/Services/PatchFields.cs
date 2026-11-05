using System.Text.Json;
using WeShare.Core.Exceptions;
namespace WeShare.Application.Services;
internal static class PatchFields
{
    internal static void Validate(JsonElement patch, string[] allowed)
    {
        if (patch.ValueKind != JsonValueKind.Object || !patch.EnumerateObject().Any())
            throw new BadRequestException("PATCH phải là object không rỗng.");
        var names = patch.EnumerateObject().Select(p => p.Name).ToList();
        if (names.Distinct().Count() != names.Count || names.Any(n => !allowed.Contains(n)))
            throw new BadRequestException("PATCH chứa field không được phép hoặc trùng lặp.");
    }
    internal static T? Get<T>(JsonElement patch, string name, T? previous)
    {
        if (!patch.TryGetProperty(name, out var value)) return previous;
        try { return value.Deserialize<T>(); }
        catch (JsonException) { throw new BadRequestException($"Field {name} không đúng định dạng."); }
    }
}
