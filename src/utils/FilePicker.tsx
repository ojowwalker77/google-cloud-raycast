import { Form, ActionPanel, Action, useNavigation, Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { ReactNode, useState } from "react";
import { openFilePicker } from "./NativeFilePicker";
import { validateFile } from "./FileUtils";

export interface FilePickerProps {
  onFilePicked: (filePath: string) => void;
  title?: string;
  placeholder?: string;
  info?: string;
  submitTitle?: string;
  cancelTitle?: string;
  allowedFileTypes?: string[];
  children?: ReactNode;
}

/**
 * A reusable file picker component that allows users to paste file paths
 * or use the native macOS file picker
 */
export function FilePicker({
  onFilePicked,
  title = "Select File",
  placeholder = "/path/to/your/file",
  info = "Enter the full path to the file",
  submitTitle = "Select",
  cancelTitle = "Cancel",
  allowedFileTypes = [],
  children,
}: FilePickerProps) {
  const { pop } = useNavigation();
  const [filePath, setFilePath] = useState<string>("");
<<<<<<< HEAD

  const handleBrowse = async () => {
    try {
=======
  const [error, setError] = useState<string | undefined>();

  const handleBrowse = async () => {
    try {
      setError(undefined);
>>>>>>> 21d012a (v0.2.32)
      const selectedPath = await openFilePicker({
        prompt: "Select a file",
        allowedFileTypes: allowedFileTypes,
      });

      if (selectedPath && typeof selectedPath === "string") {
        setFilePath(selectedPath);
      } else if (selectedPath !== undefined) {
<<<<<<< HEAD
        // Only show error if the picker wasn't cancelled (undefined)
=======
        setError("Please select a valid file");
>>>>>>> 21d012a (v0.2.32)
        await showFailureToast({
          title: "Invalid Selection",
          message: "Please select a valid file",
        });
      }
    } catch (error) {
      console.error("Error opening file picker:", error);
<<<<<<< HEAD
=======
      setError("Failed to open file picker");
>>>>>>> 21d012a (v0.2.32)
      await showFailureToast({
        title: "File Picker Error",
        message: error instanceof Error ? error.message : "Failed to open file picker",
      });
    }
  };

  const handleSubmit = async (values: { filePath: string }) => {
    if (!values.filePath) {
<<<<<<< HEAD
=======
      setError("Please select a file or enter a valid file path");
>>>>>>> 21d012a (v0.2.32)
      await showFailureToast({
        title: "No File Selected",
        message: "Please select a file or enter a valid file path",
      });
      return;
    }

    try {
<<<<<<< HEAD
=======
      setError(undefined);
>>>>>>> 21d012a (v0.2.32)
      // Validate the file before proceeding
      const isValid = await validateFile(values.filePath);
      if (isValid) {
        onFilePicked(values.filePath);
        pop();
<<<<<<< HEAD
      }
      // Note: validateFile already shows appropriate error toasts if validation fails
    } catch (error) {
      console.error("Error validating file:", error);
=======
      } else {
        setError("Invalid file path or file type");
      }
    } catch (error) {
      console.error("Error validating file:", error);
      setError(error instanceof Error ? error.message : "Failed to validate file");
>>>>>>> 21d012a (v0.2.32)
      await showFailureToast({
        title: "Validation Error",
        message: error instanceof Error ? error.message : "Failed to validate file",
      });
    }
  };

  return (
    <Form
      navigationTitle={title}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={submitTitle}
            icon={submitTitle.toLowerCase().includes("upload") ? Icon.Upload : Icon.Check}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
            onSubmit={handleSubmit}
          />
          <Action
            title="Browse…"
            icon={Icon.Finder}
            shortcut={{ modifiers: ["cmd"], key: "o" }}
            onAction={handleBrowse}
          />
          <Action title={cancelTitle} icon={Icon.XmarkCircle} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="filePath"
        title="File Path"
        placeholder={placeholder}
        info={info}
<<<<<<< HEAD
        value={filePath}
        onChange={setFilePath}
=======
        error={error}
        value={filePath}
        onChange={(newValue) => {
          setFilePath(newValue);
          setError(undefined);
        }}
>>>>>>> 21d012a (v0.2.32)
        autoFocus
      />
      <Form.Description
        title="Options"
        text="You can either paste a file path or click 'Browse...' to select a file using the native file picker."
      />
      {children}
    </Form>
  );
}

/**
 * A specialized version of FilePicker for uploading files to cloud storage
 */
export function CloudStorageUploader({
  onFilePicked,
  destinationInfo,
  title = "Upload File",
  allowedFileTypes = [],
}: {
  onFilePicked: (filePath: string) => void;
  destinationInfo: string;
  title?: string;
  allowedFileTypes?: string[];
}) {
  return (
    <FilePicker
      onFilePicked={onFilePicked}
      title={title}
      placeholder="/path/to/your/file.txt"
      info="Enter the full path to the file you want to upload or click 'Browse...'"
      submitTitle="Upload"
      cancelTitle="Cancel"
      allowedFileTypes={allowedFileTypes}
    >
      <Form.Description title="Destination" text={destinationInfo} />
    </FilePicker>
  );
}
