using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MockMate.Application.Abstractions;
using MockMate.Infrastructure.Ai;
using MockMate.Infrastructure.Persistence;

namespace MockMate.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(o =>
            o.UseSqlServer(config.GetConnectionString("Default")));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.Configure<OllamaOptions>(config.GetSection("Ollama"));
        services.AddHttpClient<IAiService, OllamaAiService>((sp, client) =>
        {
            var opt = config.GetSection("Ollama").Get<OllamaOptions>() ?? new OllamaOptions();
            client.BaseAddress = new Uri(opt.BaseUrl);
            client.Timeout = TimeSpan.FromMinutes(5);
        });

        return services;
    }
}