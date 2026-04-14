using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VivatoTemplate.Api.Identity;
using VivatoTemplate.Api.Models;

namespace VivatoTemplate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = ApplicationRoles.Administrators)]
public sealed class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("[action]")]
    public async Task<IReturnViewModel> GetUsers()
    {
        var users = await userManager.Users
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ThenBy(x => x.Email)
            .ToListAsync();

        var response = new List<UserSummaryResponse>(users.Count);
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            response.Add(UserSummaryResponse.FromUser(user, roles));
        }

        return new ReturnViewModel<IReadOnlyList<UserSummaryResponse>>(response);
    }

    [HttpGet("[action]/{id}")]
    public async Task<IReturnViewModel> GetUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<UserSummaryResponse>(UserSummaryResponse.FromUser(user, roles));
    }

    [HttpGet("[action]")]
    public IReturnViewModel GetRoles()
    {
        return new ReturnViewModel<IReadOnlyList<string>>(ApplicationRoles.All);
    }

    [HttpPost("[action]")]
    public async Task<IReturnViewModel> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!ApplicationRoles.All.Contains(request.Role))
        {
            return new ReturnViewModel(false, "Invalid role supplied.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return new ReturnViewModel(false, "That email address is already in use.");
        }

        var user = ApplicationUser.CreateUser(request.Email, request.FirstName, request.LastName, request.EmailConfirmed);
        if (request.IsArchived)
        {
            user.Deactivate();
        }

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return new ReturnViewModel(false, createResult.Errors.FirstOrDefault()?.Description ?? "User creation failed.");
        }

        var addRoleResult = await userManager.AddToRoleAsync(user, request.Role);
        if (!addRoleResult.Succeeded)
        {
            return new ReturnViewModel(false, addRoleResult.Errors.FirstOrDefault()?.Description ?? "Assigning the role failed.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<UserSummaryResponse>(UserSummaryResponse.FromUser(user, roles));
    }

    [HttpPost("[action]/{id}")]
    public async Task<IReturnViewModel> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (!ApplicationRoles.All.Contains(request.Role))
        {
            return new ReturnViewModel(false, "Invalid role supplied.");
        }

        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null && existingUser.Id != user.Id)
        {
            return new ReturnViewModel(false, "That email address is already in use.");
        }

        var currentUserId = userManager.GetUserId(User);
        if (string.Equals(currentUserId, user.Id, StringComparison.Ordinal) &&
            !string.Equals(request.Role, ApplicationRoles.SuperAdmin, StringComparison.Ordinal))
        {
            return new ReturnViewModel(false, "You cannot remove your own SuperAdmin role.");
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        if (currentRoles.Contains(ApplicationRoles.SuperAdmin) &&
            !string.Equals(request.Role, ApplicationRoles.SuperAdmin, StringComparison.Ordinal) &&
            await IsLastActiveSuperAdminAsync(user))
        {
            return new ReturnViewModel(false, "At least one active SuperAdmin account is required.");
        }

        user.UpdateName(request.FirstName, request.LastName);
        user.UpdateEmailAddress(request.Email);
        if (request.EmailConfirmed && !user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
        }

        if (request.IsArchived)
        {
            user.Deactivate();
        }
        else
        {
            user.Activate();
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return new ReturnViewModel(false, updateResult.Errors.FirstOrDefault()?.Description ?? "Updating the user failed.");
        }

        if (currentRoles.Count > 0)
        {
            var removeRolesResult = await userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeRolesResult.Succeeded)
            {
                return new ReturnViewModel(false, removeRolesResult.Errors.FirstOrDefault()?.Description ?? "Updating roles failed.");
            }
        }

        var addRoleResult = await userManager.AddToRoleAsync(user, request.Role);
        if (!addRoleResult.Succeeded)
        {
            return new ReturnViewModel(false, addRoleResult.Errors.FirstOrDefault()?.Description ?? "Updating roles failed.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<UserSummaryResponse>(UserSummaryResponse.FromUser(user, roles));
    }

    [HttpPost("[action]/{id}")]
    public async Task<IReturnViewModel> SetPassword(string id, [FromBody] SetPasswordRequest request)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var removeResult = await userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded && removeResult.Errors.Any(x => x.Code != "PasswordMismatch"))
        {
            return new ReturnViewModel(false, removeResult.Errors.FirstOrDefault()?.Description ?? "Removing the existing password failed.");
        }

        var addResult = await userManager.AddPasswordAsync(user, request.NewPassword);
        if (!addResult.Succeeded)
        {
            return new ReturnViewModel(false, addResult.Errors.FirstOrDefault()?.Description ?? "Setting the password failed.");
        }

        return new ReturnViewModel();
    }

    [HttpPost("[action]/{id}")]
    public async Task<IReturnViewModel> ActivateUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        user.Activate();
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return new ReturnViewModel(false, result.Errors.FirstOrDefault()?.Description ?? "Activating the user failed.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<UserSummaryResponse>(UserSummaryResponse.FromUser(user, roles));
    }

    [HttpPost("[action]/{id}")]
    public async Task<IReturnViewModel> DeactivateUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var currentUserId = userManager.GetUserId(User);
        if (string.Equals(currentUserId, user.Id, StringComparison.Ordinal))
        {
            return new ReturnViewModel(false, "You cannot deactivate your own account.");
        }

        if (await userManager.IsInRoleAsync(user, ApplicationRoles.SuperAdmin) &&
            await IsLastActiveSuperAdminAsync(user))
        {
            return new ReturnViewModel(false, "At least one active SuperAdmin account is required.");
        }

        user.Deactivate();
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return new ReturnViewModel(false, result.Errors.FirstOrDefault()?.Description ?? "Deactivating the user failed.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<UserSummaryResponse>(UserSummaryResponse.FromUser(user, roles));
    }

    private async Task<bool> IsLastActiveSuperAdminAsync(ApplicationUser user)
    {
        var superAdmins = await userManager.GetUsersInRoleAsync(ApplicationRoles.SuperAdmin);
        return superAdmins.Count(x => !x.IsArchived && x.Id != user.Id) == 0;
    }
}

public sealed record CreateUserRequest(
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string Role,
    bool EmailConfirmed = true,
    bool IsArchived = false);

public sealed record UpdateUserRequest(
    string Email,
    string FirstName,
    string LastName,
    string Role,
    bool EmailConfirmed,
    bool IsArchived);

public sealed record SetPasswordRequest(string NewPassword);

public sealed record UserSummaryResponse(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    bool EmailConfirmed,
    bool IsArchived,
    DateTime InsertStamp,
    IReadOnlyList<string> Roles)
{
    public static UserSummaryResponse FromUser(ApplicationUser user, IEnumerable<string> roles)
    {
        return new UserSummaryResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName ?? string.Empty,
            user.LastName ?? string.Empty,
            user.FullName,
            user.EmailConfirmed,
            user.IsArchived,
            user.InsertStamp,
            roles.ToArray());
    }
}
