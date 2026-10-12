using ToeicApp.Debugging;

namespace ToeicApp;

public class ToeicAppConsts
{
    public const string LocalizationSourceName = "ToeicApp";

    public const string ConnectionStringName = "Default";

    public const bool MultiTenancyEnabled = true;


    /// <summary>
    /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
    /// </summary>
    public static readonly string DefaultPassPhrase =
        DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "704a66be9b6541018153e824d1d55ab6";
}
