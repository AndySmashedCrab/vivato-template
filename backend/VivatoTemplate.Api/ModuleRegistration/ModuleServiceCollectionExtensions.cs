namespace VivatoTemplate.Api.ModuleRegistration;

public static class ModuleServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationModules(this IServiceCollection services, IConfiguration configuration)
    {
        // Register modules explicitly here, for example:
        // services.AddReportingModule(configuration);

        return services;
    }
}
