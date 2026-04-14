using VivatoTemplate.Api.Data;
using VivatoTemplate.Api.ErrorHandling;
using VivatoTemplate.Api.Logging;
using VivatoTemplate.Api.Modules;

namespace VivatoTemplate.Api;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddPlatformLogging();
        builder.Services.AddPlatformServices(builder.Configuration);
        builder.Services.AddApplicationModules(builder.Configuration);

        var app = builder.Build();

        await SeedData.InitialiseAsync(app.Services, app.Configuration);

        app.UsePlatformErrorHandling();

        app.UseHttpsRedirection();
        app.UseCors("Frontend");
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        await app.RunAsync();
    }
}
