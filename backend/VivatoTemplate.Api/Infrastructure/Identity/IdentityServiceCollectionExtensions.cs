namespace VivatoTemplate.Api.Infrastructure.Identity;

public static class IdentityServiceCollectionExtensions
{
    public static IServiceCollection AddPlatformIdentity(this IServiceCollection services, IConfiguration configuration)
    {
        // Identity, persistence, JWT, and role seeding are added in the next step.
        services.AddAuthentication();
        services.AddAuthorization();

        return services;
    }
}
