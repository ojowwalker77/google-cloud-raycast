import { Form, ActionPanel, Action, useNavigation, showToast, Toast } from "@raycast/api";
import { homedir } from "os";
import { join } from "path";
import { ReactNode, useState } from "react";
import { openSaveDialog } from "./NativeFilePicker";
import { ensureDirectoryExists } from "./FileUtils";
import { Icon } from "@raycast/api";

export interface FileDownloadProps {
  onDownload: (downloadPath: string) => Promise<void>;
  fileName: string;
  title?: string;
  defaultLocation?: string;
  children?: ReactNode;
}

/**
 * A reusable file downloader component that allows users to specify download location
 * or use the native macOS save dialog
 */
export function FileDownloader({
  onDownload,
  fileName,
  title = "Download File",
  defaultLocation = join(homedir(), "Downloads"),
  children,
}: FileDownloadProps) {
  const { pop } = useNavigation();
  const [downloadPath, setDownloadPath] = useState<string>(join(defaultLocation, fileName));
  
  const handleBrowse = async () => {
    const savePath = await openSaveDialog({
      prompt: "Save file as",
      defaultName: fileName,
      defaultLocation: defaultLocation,
    });

    if (savePath) {
      setDownloadPath(savePath);
    }
  };

  return (
    <Form
      navigationTitle={title}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Download"
            icon={Icon.Download}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
            onSubmit={async (values) => {
              const path = values.downloadPath || downloadPath;
              
              // Ensure the directory exists
              try {
                const dirPath = path.substring(0, path.lastIndexOf('/'));
                await ensureDirectoryExists(dirPath);
              } catch (error) {
                showToast({
                  style: Toast.Style.Failure,
                  title: "Directory Error",
                  message: "Could not create or access the download directory",
                });
                return;
              }
              
              const downloadingToast = await showToast({
                style: Toast.Style.Animated,
                title: "Downloading...",
                message: `To: ${path}`,
              });
              
              try {
                await onDownload(path);
                downloadingToast.hide();
                showToast({
                  style: Toast.Style.Success,
                  title: "Download complete",
                  message: path,
                });
                pop();
              } catch (error: any) {
                downloadingToast.hide();
                showToast({
                  style: Toast.Style.Failure,
                  title: "Download failed",
                  message: error.message,
                });
              }
            }}
          />
          <Action 
            title="Browse..." 
            icon={Icon.Finder} 
            shortcut={{ modifiers: ["cmd"], key: "o" }}
            onAction={handleBrowse} 
          />
          <Action title="Cancel" icon={Icon.XmarkCircle} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="downloadPath"
        title="Download Location"
        placeholder={join(defaultLocation, fileName)}
        value={downloadPath}
        onChange={setDownloadPath}
        info="Enter the full path where you want to save the file or click 'Browse...' to select a location using the native save dialog."
        autoFocus
      />
      <Form.Description
        title="Options"
        text="You can either enter a download path or click 'Browse...' to select a location using the native save dialog."
      />
      <Form.Description
        title="File Information"
        text={`Filename: ${fileName}`}
      />
      {children}
    </Form>
  );
}

/**
 * A specialized version of FileDownloader for cloud storage objects
 */
export function CloudStorageDownloader({
  onDownload,
  fileName,
  bucketName,
  objectName,
  title = "Download Object",
}: {
  onDownload: (downloadPath: string) => Promise<void>;
  fileName: string;
  bucketName: string;
  objectName: string;
  title?: string;
}) {
  return (
    <FileDownloader
      onDownload={onDownload}
      fileName={fileName}
      title={title}
    >
      <Form.Description
        title="Source"
        text={`Bucket: ${bucketName}\nObject: ${objectName}`}
      />
    </FileDownloader>
  );
} 