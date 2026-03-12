namespace VivatoTemplate.Api.Infrastructure.Logging;

public static class LoggingExtensions
{
    public static WebApplicationBuilder AddPlatformLogging(this WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();

        return builder;
    }
}
