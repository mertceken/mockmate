using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MockMate.Application.Exceptions;

namespace MockMate.API.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        if (exception is OperationCanceledException && ct.IsCancellationRequested)
            return false;

        var (status, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            BadRequestException => (StatusCodes.Status400BadRequest, "Bad request"),
            HttpRequestException => (StatusCodes.Status503ServiceUnavailable, "AI service is unavailable"),
            JsonException => (StatusCodes.Status502BadGateway, "AI returned an invalid response"),
            TaskCanceledException => (StatusCodes.Status504GatewayTimeout, "AI service timed out"),
            _ => (StatusCodes.Status500InternalServerError, "Unexpected error")
        };

        if (status >= 500)
            logger.LogError(exception, "Unhandled error: {Title}", title);
        else
            logger.LogWarning("Request failed: {Message}", exception.Message);

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status is 400 or 404 ? exception.Message : null
        }, ct);

        return true;
    }
}