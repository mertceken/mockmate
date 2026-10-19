using Microsoft.Extensions.DependencyInjection;
using MockMate.Application.Abstractions;
using MockMate.Application.Services;

namespace MockMate.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInterviewService, InterviewService>();
        return services;
    }
}