import { showToast, Toast, getPreferenceValues } from "@raycast/api";
import { useState } from "react";
import { SettingsView } from "./views/SettingsView";
import { showFailureToast } from "@raycast/utils";
import { Preferences } from "./common/types";
import { authenticateWithBrowser } from "./gcloud";
import { CacheManager } from "./utils/CacheManager";
import { join } from "path";

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  // Ensure we're using the correct path to the gcloud executable
  const [gcloudPath] = useState(() => {
    const basePath = preferences.gcloudPath;
    // If the path ends with 'google-cloud-sdk', append /bin/gcloud
    if (basePath.endsWith('google-cloud-sdk')) {
      return join(basePath, 'bin', 'gcloud');
    }
    return basePath;
  });

  async function handleLoginWithDifferentAccount() {
    try {
      console.log("Using gcloud path:", gcloudPath);
      
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Starting login process...",
      });

      console.log("Starting login with different account process");
      
      // Clear all caches first
      CacheManager.clearAuthCache();
      CacheManager.clearProjectCache();
      CacheManager.clearProjectsListCache();
      
      console.log("Cleared all caches");

      // Start authentication process
      await authenticateWithBrowser(gcloudPath);
      
      // Get the new user's email
      const { execSync } = require("child_process");
      const userEmail = execSync(
        `${gcloudPath} auth list --format="value(account)" --filter="status=ACTIVE"`,
        { encoding: "utf8" }
      ).trim();

      console.log("Successfully authenticated as:", userEmail);

      // Update cache with new user
      CacheManager.saveAuthStatus(true, userEmail);
      
      toast.hide();
      
      await showToast({
        style: Toast.Style.Success,
        title: "Successfully logged in",
        message: `Logged in as ${userEmail}`,
      });

    } catch (error) {
      console.error("Login error:", error);
      await showFailureToast({
        title: "Failed to open login",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return <SettingsView gcloudPath={gcloudPath} onLoginWithDifferentAccount={handleLoginWithDifferentAccount} />;
}
