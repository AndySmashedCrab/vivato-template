using VivatoTemplate.Api.ErrorHandling;
using VivatoTemplate.Api.Identity;

namespace VivatoTemplate.Api;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformServices(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
            ["http://localhost:5173", "https://localhost:5173"];

        services.AddControllers();
        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddPlatformErrorHandling();
        services.AddPlatformIdentity(configuration);

        return services;
    }
}
