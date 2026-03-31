using Microsoft.AspNetCore.Identity;

namespace VivatoTemplate.Api.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; private set; }

    public string? LastName { get; private set; }

    public string FullName => string.Join(' ', new[] { FirstName, LastName }.Where(x => !string.IsNullOrWhiteSpace(x)));

    public bool IsArchived { get; private set; }

    public DateTime InsertStamp { get; private set; } = DateTime.UtcNow;

    public string? RefreshToken { get; private set; }

    public DateTime? RefreshTokenExpiryStamp { get; private set; }

    public ApplicationUser()
    {
    }

    private ApplicationUser(string email, string firstName, string lastName, bool emailConfirmed)
    {
        UserName = email;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        EmailConfirmed = emailConfirmed;
        LockoutEnabled = false;
        IsArchived = false;
        InsertStamp = DateTime.UtcNow;
    }

    public static ApplicationUser CreateAdmin(string email, string firstName, string lastName)
    {
        return new ApplicationUser(email, firstName, lastName, emailConfirmed: true);
    }

    public void Activate()
    {
        LockoutEnabled = false;
        LockoutEnd = null;
        IsArchived = false;
    }

    public void Deactivate()
    {
        LockoutEnabled = true;
        LockoutEnd = DateTimeOffset.MaxValue;
        IsArchived = true;
    }

    public void UpdateName(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
    }

    public void UpdateEmailAddress(string email)
    {
        Email = email;
        UserName = email;
        NormalizedEmail = email.ToUpperInvariant();
        NormalizedUserName = email.ToUpperInvariant();
    }

    public void SetRefreshToken(string refreshToken, DateTime refreshTokenExpiryStamp)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryStamp = refreshTokenExpiryStamp;
    }

    public void ClearRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryStamp = null;
    }
}
