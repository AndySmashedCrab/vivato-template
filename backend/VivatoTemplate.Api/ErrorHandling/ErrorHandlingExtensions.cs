namespace VivatoTemplate.Api.ErrorHandling;

public static class ErrorHandlingExtensions
{
    public static IServiceCollection AddPlatformErrorHandling(this IServiceCollection services)
    {
        return services;
    }

    public static IApplicationBuilder UsePlatformErrorHandling(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        return app;
    }
}
