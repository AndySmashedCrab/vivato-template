using VivatoTemplate.Api.Infrastructure.ErrorHandling;
using VivatoTemplate.Api.Infrastructure.Identity;

namespace VivatoTemplate.Api.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddOpenApi();
        services.AddPlatformErrorHandling();
        services.AddPlatformIdentity(configuration);

        return services;
    }
}
