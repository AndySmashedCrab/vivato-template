using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VivatoTemplate.Api.Identity;

namespace VivatoTemplate.Api.Data;

public static class SeedData
{
    public static async Task InitialiseAsync(IServiceProvider services, IConfiguration configuration, CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var serviceProvider = scope.ServiceProvider;

        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);

        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var roleName in ApplicationRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create role '{roleName}': {string.Join("; ", roleResult.Errors.Select(x => x.Description))}");
                }
            }
        }

        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var email = configuration["SeedData:AdminEmail"];
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("SeedData:AdminEmail must be configured.");
        }

        var existingUser = await userManager.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (existingUser is null)
        {
            var password = configuration["SeedData:AdminPassword"];
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException("SeedData:AdminPassword must be configured before the initial admin user can be created.");
            }

            var firstName = configuration["SeedData:AdminFirstName"] ?? "Platform";
            var lastName = configuration["SeedData:AdminLastName"] ?? "Admin";

            var user = ApplicationUser.CreateAdmin(email, firstName, lastName);
            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create initial admin user: {string.Join("; ", createResult.Errors.Select(x => x.Description))}");
            }

            existingUser = user;
        }

        if (!await userManager.IsInRoleAsync(existingUser, ApplicationRoles.SuperAdmin))
        {
            var addRoleResult = await userManager.AddToRoleAsync(existingUser, ApplicationRoles.SuperAdmin);
            if (!addRoleResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to assign '{ApplicationRoles.SuperAdmin}' role: {string.Join("; ", addRoleResult.Errors.Select(x => x.Description))}");
            }
        }
    }
}
