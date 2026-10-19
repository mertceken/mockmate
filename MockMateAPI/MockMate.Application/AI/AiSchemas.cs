using System.Text.Json;

namespace MockMate.Application.Ai;

public static class AiSchemas
{
    private static JsonElement Parse(string json) => JsonDocument.Parse(json).RootElement.Clone();

    public static readonly JsonElement Questions = Parse("""
    {
      "type": "object",
      "properties": {
        "questions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "text": { "type": "string" },
              "topic": { "type": "string" },
              "category": { "type": "string", "enum": ["Technical", "Behavioral", "SystemDesign"] },
              "difficulty": { "type": "string", "enum": ["Easy", "Medium", "Hard"] }

            },
           "required": ["text", "topic", "category", "difficulty"]
          }
        }
      },
      "required": ["questions"]
    }
    """);

    public static readonly JsonElement Evaluation = Parse("""
    {
      "type": "object",
      "properties": {
        "score": { "type": "integer", "minimum": 0, "maximum": 10 },
        "feedback": { "type": "string" },
        "strengths": { "type": "array", "items": { "type": "string" } },
        "improvements": { "type": "array", "items": { "type": "string" } },
        "idealAnswerHint": { "type": "string" }
      },
      "required": ["score", "feedback", "strengths", "improvements", "idealAnswerHint"]
    }
    """);

    public static readonly JsonElement Report = Parse("""
    {
      "type": "object",
      "properties": {
        "summary": { "type": "string" },
        "recommendations": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["summary", "recommendations"]
    }
    """);
}
    