using VivatoTemplate.Api.Infrastructure.DependencyInjection;
using VivatoTemplate.Api.Infrastructure.ErrorHandling;
using VivatoTemplate.Api.Infrastructure.Logging;
using VivatoTemplate.Api.ModuleRegistration;

var builder = WebApplication.CreateBuilder(args);

builder.AddPlatformLogging();
builder.Services.AddPlatformServices(builder.Configuration);
builder.Services.AddApplicationModules(builder.Configuration);

var app = builder.Build();

app.UsePlatformErrorHandling();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();
