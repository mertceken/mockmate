using System.Text.Json;

namespace MockMate.Application.Abstractions;

public interface IAiService
{
    Task<T> GenerateJsonAsync<T>(
        string systemPrompt,
        string userPrompt,
        JsonElement jsonSchema,
        CancellationToken ct = default);
}
