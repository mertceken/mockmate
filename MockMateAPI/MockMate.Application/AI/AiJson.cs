using System.Text.Json;
using System.Text.Json.Serialization;

namespace MockMate.Application.Ai;

public static class AiJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };
}