namespace VivatoTemplate.Api.Infrastructure.ErrorHandling;

public static class ErrorHandlingExtensions
{
    public static IServiceCollection AddPlatformErrorHandling(this IServiceCollection services)
    {
        services.AddProblemDetails();

        return services;
    }

    public static IApplicationBuilder UsePlatformErrorHandling(this IApplicationBuilder app)
    {
        app.UseExceptionHandler();

        return app;
    }
}
