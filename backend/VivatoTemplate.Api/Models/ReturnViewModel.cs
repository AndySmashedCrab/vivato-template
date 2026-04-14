namespace VivatoTemplate.Api.Models;

public interface IReturnViewModel
{
    bool Success { get; set; }

    List<string> Messages { get; set; }
}

public class ReturnViewModel : IReturnViewModel
{
    public bool Success { get; set; } = true;

    public List<string> Messages { get; set; } = [];

    public ReturnViewModel()
    {
    }

    public ReturnViewModel(bool success, List<string> messages)
    {
        Success = success;
        Messages = messages;
    }

    public ReturnViewModel(bool success, string? message = null)
    {
        Success = success;
        if (message is not null)
        {
            Messages = [message];
        }
    }

    public ReturnViewModel(Exception exception)
    {
        Success = false;

        if (IsDevelopment())
        {
            Exception? currentException = exception;
            while (currentException is not null)
            {
                Messages.Add(currentException.Message);
                currentException = currentException.InnerException;
            }
        }
        else
        {
            Messages = ["Internal Server Error"];
        }
    }

    private static bool IsDevelopment()
    {
        return string.Equals(
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            "Development",
            StringComparison.OrdinalIgnoreCase);
    }
}

public class ReturnViewModel<T> : ReturnViewModel
{
    public T? Value { get; set; } = default;

    public ReturnViewModel(T value)
    {
        Value = value;
    }

    public ReturnViewModel(T value, bool success, List<string> messages)
    {
        Success = success;
        Value = value;
        Messages = messages;
    }
}
