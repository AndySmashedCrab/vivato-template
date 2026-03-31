using VivatoTemplate.Api.ErrorHandling;
using VivatoTemplate.Api.Identity;

namespace VivatoTemplate.Api;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddOpenApi();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddPlatformErrorHandling();
        services.AddPlatformIdentity(configuration);

        return services;
    }
}
