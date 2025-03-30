import { ActionPanel, Action, List, Icon, useNavigation, showToast, Toast, Color, Cache } from "@raycast/api";
import { useState, useEffect } from "react";
import { CacheManager } from "../utils/CacheManager";
import { showFailureToast } from "@raycast/utils";
import { ShortcutsView } from "./ShortcutsView";

// Create cache instances
const settingsCache = new Cache({ namespace: "settings" });

interface SettingsViewProps {
  gcloudPath: string;
  onLoginWithDifferentAccount?: () => void;
}

export function SettingsView({ gcloudPath, onLoginWithDifferentAccount }: SettingsViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [cacheLimit, setCacheLimit] = useState(1);
  const [authCacheDuration, setAuthCacheDuration] = useState(72);
  const [currentUser, setCurrentUser] = useState<string>("");
  const { pop } = useNavigation();

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setIsLoading(true);
    try {
      // Load cache settings
      const cachedLimit = CacheManager.getCacheLimit();
      const cachedAuthDuration = parseInt(settingsCache.get("auth-cache-duration") || "72", 10);
      const authStatus = CacheManager.getAuthStatus();

      setCacheLimit(cachedLimit);
      setAuthCacheDuration(cachedAuthDuration);
      setCurrentUser(authStatus?.user || "");
    } catch (error) {
      await showFailureToast({
        title: "Failed to load settings",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCacheLimit(limit: number) {
    try {
      const loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Updating cache settings...",
        message: `Setting project cache limit to ${limit}`,
      });

      setCacheLimit(limit);
      settingsCache.set("cache-limit", limit.toString());

      // Update recently used projects list to match new limit
      const recentlyUsedIds = CacheManager.getRecentlyUsedProjects();
      const trimmedRecentlyUsed = recentlyUsedIds.slice(0, limit);
      CacheManager.saveRecentlyUsedProjects(trimmedRecentlyUsed);

      loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: "Cache settings updated",
        message: `Project cache limit set to ${limit}`,
      });
    } catch (error) {
      await showFailureToast({
        title: "Failed to update cache settings",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function updateAuthCacheDuration(hours: number) {
    try {
      const loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Updating auth cache settings...",
        message: `Setting auth cache duration to ${hours} hours`,
      });

      CacheManager.updateAuthCacheDuration(hours);
      setAuthCacheDuration(hours);
      settingsCache.set("auth-cache-duration", hours.toString());

      loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: "Auth cache settings updated",
        message: `Auth cache duration set to ${hours} hours`,
      });
    } catch (error) {
      await showFailureToast({
        title: "Failed to update auth cache settings",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function clearAllCache() {
    try {
      const loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Clearing all cache...",
      });

      CacheManager.clearAuthCache();
      settingsCache.clear();

      loadingToast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: "Cache cleared",
        message: "All cache has been cleared successfully",
      });

      // Reinitialize settings
      initialize();
    } catch (error) {
      await showFailureToast({
        title: "Failed to clear cache",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <List isLoading={isLoading} navigationTitle="Google Cloud Settings" searchBarPlaceholder="Search settings...">
      <List.Section title="Authentication" subtitle="Manage your Google Cloud authentication">
        <List.Item
          title="Current User"
          icon={{ source: Icon.Person, tintColor: Color.Blue }}
          accessories={[{ text: currentUser || "Not authenticated" }]}
        />
        {onLoginWithDifferentAccount && (
          <List.Item
            title="Login with Different Account"
            icon={{ source: Icon.AddPerson, tintColor: Color.Purple }}
            actions={
              <ActionPanel>
                <Action title="Switch Account" onAction={onLoginWithDifferentAccount} />
              </ActionPanel>
            }
          />
        )}
        <List.Item
          title="Auth Cache Duration"
          subtitle="How long to cache authentication status"
          icon={{ source: Icon.Key, tintColor: Color.Yellow }}
          accessories={[
            {
              text: `Currently: ${authCacheDuration} hours`,
              icon: Icon.Clock,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Cache for 1 Hour"
                icon={authCacheDuration === 1 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateAuthCacheDuration(1)}
              />
              <Action
                title="Cache for 12 Hours"
                icon={authCacheDuration === 12 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateAuthCacheDuration(12)}
              />
              <Action
                title="Cache for 24 Hours"
                icon={authCacheDuration === 24 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateAuthCacheDuration(24)}
              />
              <Action
                title="Cache for 72 Hours"
                icon={authCacheDuration === 72 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateAuthCacheDuration(72)}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Cache" subtitle="Manage project caching behavior">
        <List.Item
          title="Project Cache Limit"
          subtitle="Configure how many projects to cache"
          icon={{ source: Icon.Gear, tintColor: Color.Purple }}
          accessories={[
            {
              text: `Currently: ${cacheLimit} project${cacheLimit > 1 ? "s" : ""}`,
              icon: Icon.Bookmark,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Cache 1 Project"
                icon={cacheLimit === 1 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateCacheLimit(1)}
              />
              <Action
                title="Cache 2 Projects"
                icon={cacheLimit === 2 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateCacheLimit(2)}
              />
              <Action
                title="Cache 3 Projects"
                icon={cacheLimit === 3 ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateCacheLimit(3)}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Clear All Cache"
          subtitle="Reset all cached data"
          icon={{ source: Icon.Trash, tintColor: Color.Red }}
          actions={
            <ActionPanel>
              <Action
                title="Clear Cache"
                style={Action.Style.Destructive}
                onAction={clearAllCache}
                shortcut={{ modifiers: ["cmd"], key: "delete" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Keyboard Shortcuts" subtitle="Customize your workflow">
        <List.Item
          title="Manage Shortcuts"
          subtitle="View and customize keyboard shortcuts"
          icon={{ source: Icon.Keyboard, tintColor: Color.Orange }}
          accessories={[{ icon: Icon.Forward }]}
          actions={
            <ActionPanel>
              <Action.Push title="View Shortcuts" icon={Icon.Keyboard} target={<ShortcutsView />} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
