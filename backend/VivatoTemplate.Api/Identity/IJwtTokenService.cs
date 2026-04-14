namespace VivatoTemplate.Api.Identity;

public interface IJwtTokenService
{
    string CreateAccessToken(ApplicationUser user, IEnumerable<string> roles);

    string CreateRefreshToken();
}
