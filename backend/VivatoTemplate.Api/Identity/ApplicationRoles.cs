namespace VivatoTemplate.Api.Identity;

public static class ApplicationRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string User = "User";
    public const string Administrators = SuperAdmin + "," + Admin;

    public static readonly string[] All = [SuperAdmin, Admin, User];
}
