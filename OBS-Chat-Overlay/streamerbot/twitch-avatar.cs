using System;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    public bool Execute()
    {
        CPH.TryGetArg("targetUserId", out string userId);
        CPH.TryGetArg("targetUserProfileImageUrl", out string avatarUrl);

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(avatarUrl))
        {
            CPH.LogWarn("Missing targetUserId or targetUserProfileImageUrl");
            return true;
        }

        var payload = new JObject
        {
            ["type"] = "avatar",
            ["platform"] = "twitch",
            ["userId"] = userId,
            ["avatar"] = avatarUrl
        };

        CPH.WebsocketBroadcastJson(payload.ToString(Newtonsoft.Json.Formatting.None));
        CPH.LogInfo("Broadcast Twitch avatar for userId=" + userId);
        return true;
    }
}
