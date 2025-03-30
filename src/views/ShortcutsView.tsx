import {
  ActionPanel,
  Action,
  List,
  Icon,
  Color,
  Form,
  showToast,
  Toast,
  useNavigation,
  LocalStorage,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { showFailureToast } from "@raycast/utils";
import EditShortcutCommand from "./EditShortcutView";

interface Shortcut {
  id: string;
  title: string;
  description: string;
  defaultShortcut: {
    modifiers: string[];
    key: string;
  };
  category: "navigation" | "actions" | "views";
  context: string;
}

const HYPER_KEY = ["cmd", "ctrl", "alt", "shift"];

const AVAILABLE_SHORTCUTS: Shortcut[] = [
  {
    id: "open-project",
    title: "Open Project",
    description: "Open the selected project",
    defaultShortcut: { modifiers: HYPER_KEY, key: "o" },
    category: "actions",
    context: "Project View",
  },
  {
    id: "browse-projects",
    title: "Browse Projects",
    description: "View and select from all projects",
    defaultShortcut: { modifiers: HYPER_KEY, key: "b" },
    category: "navigation",
    context: "Project View",
  },
  {
    id: "clear-cache",
    title: "Clear Cache",
    description: "Clear all cached data",
    defaultShortcut: { modifiers: HYPER_KEY, key: "c" },
    category: "actions",
    context: "Project View",
  },
  {
    id: "open-settings",
    title: "Open Settings",
    description: "Open extension settings",
    defaultShortcut: { modifiers: HYPER_KEY, key: "," },
    category: "navigation",
    context: "Global",
  },
  {
    id: "refresh-view",
    title: "Refresh View",
    description: "Refresh the current view",
    defaultShortcut: { modifiers: HYPER_KEY, key: "r" },
    category: "actions",
    context: "All Views",
  },
  {
    id: "go-back",
    title: "Go Back",
    description: "Return to previous view",
    defaultShortcut: { modifiers: HYPER_KEY, key: "[" },
    category: "navigation",
    context: "All Views",
  },
];

export function ShortcutsView() {
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, { modifiers: string[]; key: string }>>({});

  useEffect(() => {
    // Load custom shortcuts from LocalStorage
    async function loadCustomShortcuts() {
      try {
        const stored = await LocalStorage.getItem<string>("custom-shortcuts");
        if (stored) {
          setCustomShortcuts(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load custom shortcuts:", error);
      }
    }

    loadCustomShortcuts();
  }, []);

  const handleShortcutUpdate = async (shortcutId: string, modifiers: string[], key: string) => {
    try {
      const newCustomShortcuts = {
        ...customShortcuts,
        [shortcutId]: { modifiers, key },
      };

      setCustomShortcuts(newCustomShortcuts);
      await LocalStorage.setItem("custom-shortcuts", JSON.stringify(newCustomShortcuts));

      await showToast({
        style: Toast.Style.Success,
        title: "Shortcut Updated",
        message: "Your custom shortcut has been saved",
      });
    } catch (error) {
      await showFailureToast({
        title: "Failed to save shortcut",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const categories = Array.from(new Set(AVAILABLE_SHORTCUTS.map((s) => s.category)));

  return (
    <List navigationTitle="Keyboard Shortcuts" searchBarPlaceholder="Search shortcuts...">
      {categories.map((category) => (
        <List.Section
          key={category}
          title={category.charAt(0).toUpperCase() + category.slice(1)}
          subtitle={`${AVAILABLE_SHORTCUTS.filter((s) => s.category === category).length} shortcuts`}
        >
          {AVAILABLE_SHORTCUTS.filter((s) => s.category === category).map((shortcut) => {
            const customShortcut = customShortcuts[shortcut.id];
            const isCustomized = !!customShortcut;

            return (
              <List.Item
                key={shortcut.id}
                title={shortcut.title}
                subtitle={shortcut.description}
                icon={getIconForCategory(shortcut.category)}
                accessories={[
                  {
                    text: shortcut.context,
                    icon: Icon.Window,
                  },
                  {
                    text: formatShortcut(customShortcut || shortcut.defaultShortcut),
                    icon: isCustomized ? Icon.Star : Icon.Keyboard,
                    tooltip: isCustomized ? "Custom Shortcut" : "Default Shortcut",
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="Edit Shortcut"
                      icon={Icon.Pencil}
                      target={
                        <EditShortcutCommand
                          shortcutData={{
                            id: shortcut.id,
                            title: shortcut.title,
                            description: shortcut.description,
                            context: shortcut.context,
                            defaultShortcut: shortcut.defaultShortcut,
                            customShortcut: customShortcut,
                          }}
                          onSave={handleShortcutUpdate}
                        />
                      }
                    />
                    <Action.CopyToClipboard
                      title="Copy Shortcut"
                      content={formatShortcut(customShortcut || shortcut.defaultShortcut)}
                      shortcut={{ modifiers: ["cmd"], key: "." }}
                    />
                    <Action.OpenInBrowser
                      title="Learn More About Raycast Shortcuts"
                      url="https://raycast.com/manual/hotkeys"
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}

function getIconForCategory(category: string): { source: Icon; tintColor: Color } {
  switch (category) {
    case "navigation":
      return { source: Icon.ArrowRight, tintColor: Color.Blue };
    case "actions":
      return { source: Icon.Hammer, tintColor: Color.Green };
    case "views":
      return { source: Icon.Eye, tintColor: Color.Purple };
    default:
      return { source: Icon.Keyboard, tintColor: Color.PrimaryText };
  }
}

function formatShortcut(shortcut: { modifiers: string[]; key: string }): string {
  const modifierSymbols: Record<string, string> = {
    cmd: "⌘",
    ctrl: "⌃",
    alt: "⌥",
    shift: "⇧",
    fn: "fn",
  };

  return [...shortcut.modifiers.map((m) => modifierSymbols[m]), shortcut.key.toUpperCase()].join("");
}
