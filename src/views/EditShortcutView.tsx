import { Form, ActionPanel, Action, Icon, useNavigation } from "@raycast/api";
import { useState } from "react";

interface Preferences {
  customShortcuts?: string;
}

interface ShortcutData {
  id: string;
  title: string;
  description: string;
  context: string;
  defaultShortcut: {
    modifiers: string[];
    key: string;
  };
  customShortcut?: {
    modifiers: string[];
    key: string;
  };
}

interface Props {
  shortcutData: ShortcutData;
  onSave: (shortcutId: string, modifiers: string[], key: string) => void;
}

const HYPER_KEY = ["cmd", "ctrl", "alt", "shift"];

export default function Command(props: Props) {
  const { shortcutData, onSave } = props;
  const { pop } = useNavigation();
  const currentShortcut = shortcutData.customShortcut || shortcutData.defaultShortcut;
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>(currentShortcut.modifiers);

  const formatShortcut = (shortcut: { modifiers: string[]; key: string }): string => {
    const modifierSymbols: Record<string, string> = {
      cmd: "⌘",
      ctrl: "⌃",
      alt: "⌥",
      shift: "⇧",
      fn: "fn",
    };

    const isHyper = HYPER_KEY.every((mod) => shortcut.modifiers.includes(mod));
    if (isHyper) {
      return `⌃⌥⇧⌘${shortcut.key.toUpperCase()}`;
    }

    return [...shortcut.modifiers.map((m) => modifierSymbols[m]), shortcut.key.toUpperCase()].join("");
  };

  const handleModifiersChange = (modifiers: string[]) => {
    if (modifiers.includes("hyper")) {
      setSelectedModifiers(HYPER_KEY);
    } else {
      setSelectedModifiers(modifiers.filter((m) => m !== "hyper"));
    }
  };

  const isHyperKey = HYPER_KEY.every((mod) => selectedModifiers.includes(mod));

  return (
    <Form
      navigationTitle={`Edit Shortcut: ${shortcutData.title}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Shortcut"
            icon={Icon.SaveDocument}
            onSubmit={(values) => {
              onSave(shortcutData.id, selectedModifiers, values.key.toLowerCase());
              pop();
            }}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
          />
          <Action
            title="Reset to Default"
            icon={Icon.ArrowClockwise}
            onAction={() => {
              onSave(shortcutData.id, shortcutData.defaultShortcut.modifiers, shortcutData.defaultShortcut.key);
              pop();
            }}
            shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
          />
          <Action title="Cancel" icon={Icon.Xmark} onAction={pop} shortcut={{ modifiers: ["cmd"], key: "escape" }} />
        </ActionPanel>
      }
    >
      <Form.Description
        title={shortcutData.title}
        text={`Configure keyboard shortcut for "${shortcutData.title}" in ${shortcutData.context}\n\nCurrent shortcut: ${formatShortcut(currentShortcut)}\nDefault shortcut: ${formatShortcut(shortcutData.defaultShortcut)}`}
      />

      <Form.Separator />

      <Form.TagPicker
        id="modifiers"
        title="Modifiers"
        value={isHyperKey ? ["hyper"] : selectedModifiers}
        onChange={handleModifiersChange}
        info="Select modifiers or use Hyper key (⌃⌥⇧⌘) to avoid conflicts with system shortcuts"
      >
        <Form.TagPicker.Item value="hyper" title="⌃⌥⇧⌘ Hyper" icon={Icon.Star} />
        <Form.TagPicker.Item value="cmd" title="⌘ Command" icon={Icon.Key} />
        <Form.TagPicker.Item value="ctrl" title="⌃ Control" icon={Icon.ArrowUpCircle} />
        <Form.TagPicker.Item value="alt" title="⌥ Option" icon={Icon.Key} />
        <Form.TagPicker.Item value="shift" title="⇧ Shift" icon={Icon.ArrowUpCircleFilled} />
      </Form.TagPicker>

      <Form.TextField
        id="key"
        title="Key"
        placeholder="Enter a key (a-z, 0-9, or special key)"
        defaultValue={currentShortcut.key}
        info="Enter a single key like 'a', 'b', '1', 'space', etc."
      />
    </Form>
  );
}
