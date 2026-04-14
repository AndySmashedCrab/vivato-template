using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VivatoTemplate.Api.Identity;
using VivatoTemplate.Api.Models;

namespace VivatoTemplate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenService jwtTokenService,
    IOptions<JwtOptions> jwtOptions) : ControllerBase
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    [AllowAnonymous]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> Login([FromBody] LoginRequest request)
    {
        DeleteAuthCookies();

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return new ReturnViewModel(false, "Invalid email or password.");
        }

        if (user.IsArchived)
        {
            return new ReturnViewModel(false, "This account is archived.");
        }

        var passwordResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!passwordResult.Succeeded)
        {
            return new ReturnViewModel(false, "Invalid email or password.");
        }

        if (!user.EmailConfirmed)
        {
            return new ReturnViewModel(false, "This account must confirm its email before signing in.");
        }

        var response = await IssueTokensAsync(user);
        return new ReturnViewModel<AuthUserResponse>(response);
    }

    [AllowAnonymous]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> Refresh()
    {
        var refreshToken = Request.Cookies[AuthCookieNames.RefreshToken];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return new ReturnViewModel(false, "No refresh token was supplied.");
        }

        var user = await userManager.Users.SingleOrDefaultAsync(x => x.RefreshToken == refreshToken);
        if (user is null || user.RefreshTokenExpiryStamp is null || user.RefreshTokenExpiryStamp <= DateTime.UtcNow)
        {
            DeleteAuthCookies();
            return new ReturnViewModel(false, "Refresh token is invalid or expired.");
        }

        var response = await IssueTokensAsync(user);
        return new ReturnViewModel<AuthUserResponse>(response);
    }

    [Authorize]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> Logout()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is not null)
        {
            user.ClearRefreshToken();
            await userManager.UpdateAsync(user);
        }

        DeleteAuthCookies();
        return new ReturnViewModel();
    }

    [Authorize]
    [HttpGet("[action]")]
    public async Task<IReturnViewModel> Me()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<AuthUserResponse>(AuthUserResponse.FromUser(user, roles));
    }

    [Authorize]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return new ReturnViewModel(false, result.Errors.FirstOrDefault()?.Description ?? "Password change failed.");
        }

        return new ReturnViewModel();
    }

    [Authorize]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> ChangeName([FromBody] ChangeNameRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        user.UpdateName(request.FirstName, request.LastName);
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return new ReturnViewModel(false, result.Errors.FirstOrDefault()?.Description ?? "Name change failed.");
        }

        var roles = await userManager.GetRolesAsync(user);
        return new ReturnViewModel<AuthUserResponse>(AuthUserResponse.FromUser(user, roles));
    }

    [Authorize]
    [HttpPost("[action]")]
    public async Task<IReturnViewModel> ChangeEmail([FromBody] ChangeEmailRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return new ReturnViewModel(false, "User not found.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null && existingUser.Id != user.Id)
        {
            return new ReturnViewModel(false, "That email address is already in use.");
        }

        user.UpdateEmailAddress(request.Email);
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return new ReturnViewModel(false, result.Errors.FirstOrDefault()?.Description ?? "Email change failed.");
        }

        var response = await IssueTokensAsync(user);
        return new ReturnViewModel<AuthUserResponse>(response);
    }

    private async Task<AuthUserResponse> IssueTokensAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var accessToken = jwtTokenService.CreateAccessToken(user, roles);
        var refreshToken = jwtTokenService.CreateRefreshToken();
        var refreshExpiry = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

        user.SetRefreshToken(refreshToken, refreshExpiry);
        await userManager.UpdateAsync(user);

        AppendCookie(AuthCookieNames.AccessToken, accessToken, DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes));
        AppendCookie(AuthCookieNames.RefreshToken, refreshToken, DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays));

        return AuthUserResponse.FromUser(user, roles);
    }

    private void AppendCookie(string cookieName, string value, DateTimeOffset expires)
    {
        Response.Cookies.Append(cookieName, value, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = expires,
        });
    }

    private void DeleteAuthCookies()
    {
        Response.Cookies.Delete(AuthCookieNames.AccessToken);
        Response.Cookies.Delete(AuthCookieNames.RefreshToken);
    }
}

public sealed record LoginRequest(string Email, string Password);

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public sealed record ChangeNameRequest(string FirstName, string LastName);

public sealed record ChangeEmailRequest(string Email);

public sealed record AuthUserResponse(string Id, string Email, string FirstName, string LastName, string FullName, IReadOnlyList<string> Roles)
{
    public static AuthUserResponse FromUser(ApplicationUser user, IEnumerable<string> roles)
    {
        return new AuthUserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName ?? string.Empty,
            user.LastName ?? string.Empty,
            user.FullName,
            roles.ToArray());
    }
}
