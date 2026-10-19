using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MockMate.Application.Abstractions;
using MockMate.Application.Ai;

namespace MockMate.Infrastructure.Ai;

public class OllamaAiService(
    HttpClient http,
    IOptions<OllamaOptions> options,
    ILogger<OllamaAiService> logger) : IAiService
{
    private const int MaxAttempts = 3;
    private readonly OllamaOptions _opt = options.Value;

    public async Task<T> GenerateJsonAsync<T>(
        string systemPrompt,
        string userPrompt,
        JsonElement jsonSchema,
        CancellationToken ct = default)
    {
        var request = new
        {
            model = _opt.Model,
            stream = false,
            format = jsonSchema,
            options = new { temperature = 0.2 },
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            }
        };

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                using var response = await http.PostAsJsonAsync("/api/chat", request, ct);
                response.EnsureSuccessStatusCode();

                var body = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(AiJson.Options, ct)
                           ?? throw new JsonException("Empty response from Ollama.");

                return JsonSerializer.Deserialize<T>(body.Message.Content, AiJson.Options)
                       ?? throw new JsonException("AI returned null JSON.");
            }
            catch (JsonException ex) when (attempt < MaxAttempts)
            {
                logger.LogWarning(ex, "AI JSON parse failed (attempt {Attempt}/{Max})", attempt, MaxAttempts);
            }
        }
    }

    private record OllamaChatResponse(OllamaMessage Message);
    private record OllamaMessage(string Role, string Content);
}