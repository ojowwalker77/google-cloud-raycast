import {
  ActionPanel,
  Action,
  List,
  showToast,
  Toast,
  Icon,
  confirmAlert,
  Detail,
  Color,
  useNavigation,
  Alert,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import { join } from "path";
import { CloudStorageUploader } from "../../utils/FilePicker";
import { CloudStorageDownloader } from "../../utils/FileDownloader";
import { formatFileSize, validateFile, getFileInfo } from "../../utils/FileUtils";
import ObjectVersionsView from "./ObjectVersionsView";

const execPromise = promisify(exec);

interface StorageObjectsViewProps {
  projectId: string;
  gcloudPath: string;
  bucketName: string;
<<<<<<< HEAD
=======
  currentPath?: string;
>>>>>>> 21d012a (v0.2.32)
}

interface StorageObject {
  id: string;
  name: string;
  size: string;
  updated: string;
  contentType: string;
<<<<<<< HEAD
}

interface GCloudObject {
  id?: string;
  name: string;
  size?: string;
  updated?: string;
  contentType?: string;
  timeCreated?: string;
  storageClass?: string;
  md5Hash?: string;
}

export default function StorageObjectsView({ projectId, gcloudPath, bucketName }: StorageObjectsViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [objects, setObjects] = useState<StorageObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { push, pop } = useNavigation();

  useEffect(() => {
    fetchObjects();
  }, []);

  async function fetchObjects() {
=======
  isFolder: boolean;
  path: string;
}

interface GCSObject {
  url: string;
  type: "prefix" | "cloud_object";
  metadata?: {
    bucket: string;
    contentType: string;
    size: string;
    timeCreated: string;
    updated: string;
    name: string;
    storageClass: string;
  };
}

export default function StorageObjectsView({
  projectId,
  gcloudPath,
  bucketName,
  currentPath = "",
}: StorageObjectsViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [objects, setObjects] = useState<StorageObject[]>([]);
  const [allObjects, setAllObjects] = useState<StorageObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLines, setAllLines] = useState<string[]>([]);
  const pageSize = 20;
  const { push, pop } = useNavigation();

  useEffect(() => {
    fetchObjects(true);
  }, [currentPath]);

  async function fetchObjects(reset = false) {
    if (reset) {
      setObjects([]);
      setAllObjects([]);
      setCurrentPage(1);
      setAllLines([]);
    }

    // If we already have the lines and just navigating pages
    if (!reset && allLines.length > 0) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentBatch = allLines.slice(startIndex, endIndex);

      const formattedObjects = formatObjects(currentBatch);
      setObjects(formattedObjects);
      setHasMore(endIndex < allLines.length);
      return;
    }

>>>>>>> 21d012a (v0.2.32)
    setIsLoading(true);
    setError(null);

    const loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Loading objects...",
<<<<<<< HEAD
      message: `Bucket: ${bucketName}`,
    });

    try {
      const command = `${gcloudPath} storage objects list gs://${bucketName} --project=${projectId} --format=json`;

      // console.log(`Executing list command: ${command}`);
      const { stdout, stderr } = await execPromise(command);

      if (stderr && stderr.includes("ERROR")) {
        throw new Error(stderr);
      }

      if (!stdout || stdout.trim() === "") {
        setObjects([]);
        loadingToast.hide();
        showToast({
          style: Toast.Style.Success,
          title: "No objects found",
          message: `Bucket "${bucketName}" is empty`,
        });
        setIsLoading(false);
        return;
      }

      const result = JSON.parse(stdout);

      const formattedObjects = result.map((obj: GCloudObject) => {
        return {
          id: obj.id || obj.name,
          name: obj.name,
          size: formatFileSize(obj.size ? parseInt(obj.size) : 0),
          updated: obj.updated || new Date().toISOString(),
          contentType: obj.contentType || guessContentTypeFromName(obj.name),
        };
      });

      setObjects(formattedObjects);

      loadingToast.hide();
      showToast({
        style: Toast.Style.Success,
        title: "Objects loaded",
        message: `Found ${formattedObjects.length} objects`,
      });
=======
      message: `Bucket: ${bucketName}${currentPath ? ` Path: ${currentPath}` : ""}`,
    });

    try {
      const prefix = currentPath ? `${currentPath}/` : "";

      // Build the command for listing objects
      const command = [
        `${gcloudPath} storage ls`,
        `gs://${bucketName}/${prefix}`,
        `--project=${projectId}`,
        `--long`, // Use long format to get metadata
      ]
        .filter(Boolean)
        .join(" ");

      console.log("Executing command:", command);
      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.log("Stderr detected:", stderr);
        if (stderr.includes("NOT_FOUND")) {
          throw new Error(`Bucket ${bucketName} not found`);
        }
        if (stderr.includes("PERMISSION_DENIED")) {
          throw new Error(`Permission denied for bucket ${bucketName}`);
        }
        if (stderr.includes("ERROR")) {
          throw new Error(stderr);
        }
      }

      // Parse the output lines
      const lines = stdout.split("\n").filter((line) => {
        // Filter out empty lines and the TOTAL line
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith("TOTAL:");
      });

      // Store all lines for pagination
      setAllLines(lines);

      // Process only the first page
      const currentBatch = lines.slice(0, pageSize);
      const formattedObjects = formatObjects(currentBatch);

      // Store all objects
      setAllObjects(formattedObjects);

      // Update state
      setObjects(formattedObjects);
      setHasMore(pageSize < lines.length);
      setCurrentPage(1);

      loadingToast.hide();

      if (formattedObjects.length > 0) {
        showToast({
          style: Toast.Style.Success,
          title: "Objects loaded",
          message: `Found ${lines.length} items${lines.length > pageSize ? " (more available)" : ""}`,
        });
      } else {
        showToast({
          style: Toast.Style.Success,
          title: currentPath ? "Folder is empty" : "Bucket is empty",
          message: currentPath ? `No items in ${currentPath}` : "Upload files to get started",
        });
      }
>>>>>>> 21d012a (v0.2.32)
    } catch (error: unknown) {
      loadingToast.hide();
      console.error("Error fetching objects:", error);

      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorTitle = "Failed to load objects";

<<<<<<< HEAD
      if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
        errorTitle = "Permission denied";
        errorMessage = `You don't have permission to list objects in bucket "${bucketName}".`;
      } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        errorTitle = "Bucket not found";
        errorMessage = `The bucket "${bucketName}" was not found. It may have been deleted.`;
      } else if (errorMessage.includes("project not found")) {
        errorTitle = "Project not found";
        errorMessage = `The project "${projectId}" was not found or you don't have access to it.`;
      }

      setError(`${errorTitle}: ${errorMessage}`);

=======
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
        errorTitle = "Permission denied";
        errorMessage = `You don't have permission to list objects in bucket "${bucketName}". Please check your authentication and permissions.`;
      } else if (errorMessage.includes("NOT_FOUND") || errorMessage.includes("404")) {
        errorTitle = "Bucket not found";
        errorMessage = `The bucket "${bucketName}" was not found. Please verify the bucket name and your access.`;
      } else if (errorMessage.includes("project not found")) {
        errorTitle = "Project not found";
        errorMessage = `The project "${projectId}" was not found or you don't have access to it. Please check your project settings.`;
      } else if (errorMessage.includes("UNAUTHENTICATED")) {
        errorTitle = "Authentication error";
        errorMessage = "Not authenticated. Please check your Google Cloud credentials.";
      }

      setError(`${errorTitle}: ${errorMessage}`);
>>>>>>> 21d012a (v0.2.32)
      showToast({
        style: Toast.Style.Failure,
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

<<<<<<< HEAD
=======
  function formatObjects(lines: string[]): StorageObject[] {
    const formattedObjects = lines.map((line) => {
      // The line is just the URL with potential whitespace
      const url = line.trim();
      const fullPath = url.replace(`gs://${bucketName}/`, "").replace(/\/$/, "");
      const name = fullPath.split("/").pop() || fullPath;
      const isFolder = url.endsWith("/");

      return {
        id: fullPath,
        name,
        size: "-",
        updated: "-",
        contentType: isFolder ? "folder" : guessContentTypeFromName(name),
        isFolder,
        path: fullPath,
      };
    });

    // Sort: folders first, then files alphabetically
    return formattedObjects.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  function loadNextPage() {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchObjects(false);
  }

  function loadPreviousPage() {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchObjects(false);
    }
  }

>>>>>>> 21d012a (v0.2.32)
  async function deleteObject(objectName: string) {
    if (
      await confirmAlert({
        title: "Delete Object",
        message: `Are you sure you want to delete "${objectName}"?`,
        icon: Icon.Trash,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const deletingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Deleting object...",
        message: objectName,
      });

      try {
<<<<<<< HEAD
        const command = `${gcloudPath} storage rm gs://${bucketName}/${objectName} --project=${projectId} --quiet`;

        // console.log(`Executing delete command: ${command}`);
=======
        const command = `gsutil rm gs://${bucketName}/${objectName}`;
>>>>>>> 21d012a (v0.2.32)
        const { stderr } = await execPromise(command);

        if (stderr && stderr.includes("ERROR")) {
          throw new Error(stderr);
        }

        deletingToast.hide();
        showToast({
          style: Toast.Style.Success,
          title: "Object deleted successfully",
          message: objectName,
        });

        fetchObjects();
      } catch (error: unknown) {
        deletingToast.hide();
        console.error("Error deleting object:", error);

        let errorMessage = error instanceof Error ? error.message : String(error);
        let errorTitle = "Failed to delete object";

        if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
          errorTitle = "Permission denied";
          errorMessage = "You don't have permission to delete this object.";
        } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          errorTitle = "Object not found";
          errorMessage = `The object "${objectName}" was not found. It may have been deleted already.`;
        }

        showToast({
          style: Toast.Style.Failure,
          title: errorTitle,
          message: errorMessage,
        });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function performDownload(objectName: string, downloadPath?: string) {
    if (downloadPath) {
<<<<<<< HEAD
      // If downloadPath is provided, download directly to that path
=======
>>>>>>> 21d012a (v0.2.32)
      const downloadingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Downloading object...",
        message: `To: ${downloadPath}`,
      });

      try {
<<<<<<< HEAD
        // Use the correct command: gcloud storage cp for copying files from buckets
        const command = `${gcloudPath} storage cp gs://${bucketName}/${objectName} ${downloadPath} --project=${projectId}`;

=======
        const command = `gsutil cp gs://${bucketName}/${objectName} ${downloadPath}`;
>>>>>>> 21d012a (v0.2.32)
        const { stderr } = await execPromise(command);

        if (stderr && stderr.includes("ERROR")) {
          throw new Error(stderr);
        }

        downloadingToast.hide();
        showToast({
          style: Toast.Style.Success,
          title: "Download complete",
          message: `Saved to ${downloadPath}`,
        });
      } catch (error: unknown) {
        downloadingToast.hide();
        console.error("Error downloading object:", error);

        // Provide more user-friendly error messages for common errors
        let errorMessage = error instanceof Error ? error.message : String(error);
        let errorTitle = "Failed to download object";

        if (typeof errorMessage === "string") {
          if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
            errorTitle = "Permission denied";
            errorMessage = "You don't have permission to download this object.";
          } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
            errorTitle = "Object not found";
            errorMessage = `The object "${objectName}" was not found.`;
          } else if (errorMessage.includes("EACCES") || errorMessage.includes("access denied")) {
            errorTitle = "Access denied";
            errorMessage = `Cannot write to ${downloadPath}. Please check your file permissions.`;
          }
        }

        showToast({
          style: Toast.Style.Failure,
          title: errorTitle,
          message: errorMessage,
        });
      }
    } else {
      // If no downloadPath is provided, show the download picker
      const safeFileName = objectName.split("/").pop() || "download";

      push(
        <CloudStorageDownloader
          onDownload={(path) => performDownload(objectName, path)}
          fileName={safeFileName}
          bucketName={bucketName}
          objectName={objectName}
          title="Download Object"
        />,
      );
    }
  }

  async function uploadObject(filePath: string) {
<<<<<<< HEAD
    // Validate the file first
=======
>>>>>>> 21d012a (v0.2.32)
    const isValid = await validateFile(filePath);
    if (!isValid) return;

    const fileInfo = await getFileInfo(filePath);
    if (!fileInfo) return;

    const uploadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Uploading object...",
      message: fileInfo.name,
    });

    try {
<<<<<<< HEAD
      // Use the correct command: gcloud storage cp for copying files to buckets
      const command = `${gcloudPath} storage cp ${filePath} gs://${bucketName}/${fileInfo.name} --project=${projectId}`;

      // console.log(`Executing upload command: ${command}`);
=======
      const command = `gsutil cp ${filePath} gs://${bucketName}/${currentPath ? currentPath + "/" : ""}${fileInfo.name}`;
>>>>>>> 21d012a (v0.2.32)
      const { stderr } = await execPromise(command);

      if (stderr && stderr.includes("ERROR")) {
        throw new Error(stderr);
      }

      uploadingToast.hide();
      showToast({
        style: Toast.Style.Success,
        title: "Upload complete",
        message: fileInfo.name,
      });

      fetchObjects();
    } catch (error: unknown) {
      uploadingToast.hide();
      console.error("Error uploading object:", error);

      // Provide more user-friendly error messages for common errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorTitle = "Failed to upload object";

      if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
        errorTitle = "Permission denied";
        errorMessage = "You don't have permission to upload to this bucket.";
      } else if (errorMessage.includes("ENOENT") || errorMessage.includes("no such file")) {
        errorTitle = "File not found";
        errorMessage = `The file "${filePath}" was not found.`;
      } else if (errorMessage.includes("EACCES") || errorMessage.includes("access denied")) {
        errorTitle = "Access denied";
        errorMessage = `Cannot read from ${filePath}. Please check your file permissions.`;
      }

      showToast({
        style: Toast.Style.Failure,
        title: errorTitle,
        message: errorMessage,
      });
    }
  }

  // Modify the selectAndUploadFile function to use the CloudStorageUploader component
  async function selectAndUploadFile() {
    push(
      <CloudStorageUploader
        onFilePicked={(filePath) => uploadObject(filePath)}
        destinationInfo={`Bucket: ${bucketName}`}
        title="Upload File to Google Cloud Storage"
      />,
    );
  }

  // Add a new function to handle direct file download using the native save dialog
  async function directDownloadObject(objectName: string) {
    const safeFileName = objectName.split("/").pop() || "download";

    const downloadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Downloading object...",
      message: objectName,
    });

    try {
      const tempDownloadPath = join(homedir(), "Downloads", safeFileName);
      const command = `${gcloudPath} storage cp gs://${bucketName}/${objectName} ${tempDownloadPath} --project=${projectId}`;

      // console.log(`Executing download command: ${command}`);
      const { stderr } = await execPromise(command);

      if (stderr && stderr.includes("ERROR")) {
        throw new Error(stderr);
      }

      downloadingToast.hide();
      showToast({
        style: Toast.Style.Success,
        title: "Download complete",
        message: `Saved to ${tempDownloadPath}`,
      });
    } catch (error: unknown) {
      downloadingToast.hide();
      console.error("Error downloading object:", error);

      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorTitle = "Failed to download object";

      if (typeof errorMessage === "string") {
        if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
          errorTitle = "Permission denied";
          errorMessage = "You don't have permission to download this object.";
        } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          errorTitle = "Object not found";
          errorMessage = `The object "${objectName}" was not found.`;
        } else if (errorMessage.includes("EACCES") || errorMessage.includes("access denied")) {
          errorTitle = "Access denied";
          errorMessage = `Cannot write to the download location. Please check your file permissions.`;
        }
      }

      showToast({
        style: Toast.Style.Failure,
        title: errorTitle,
        message: errorMessage,
      });
    }
  }

  function getContentTypeIcon(contentType: string) {
    if (contentType.startsWith("image/")) {
      return { source: Icon.Image, tintColor: Color.Purple };
    } else if (contentType.startsWith("text/")) {
      return { source: Icon.Text, tintColor: Color.Blue };
    } else if (contentType.startsWith("application/pdf")) {
      return { source: Icon.Document, tintColor: Color.Red };
    } else if (contentType.startsWith("application/json")) {
      return { source: Icon.Code, tintColor: Color.Yellow };
    } else if (contentType.startsWith("application/")) {
      return { source: Icon.Download, tintColor: Color.Green };
    } else {
      return { source: Icon.Document, tintColor: Color.PrimaryText };
    }
  }

  async function viewObjectDetails(objectName: string) {
    const loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Loading object details...",
      message: objectName,
    });

    try {
<<<<<<< HEAD
      const command = `${gcloudPath} storage objects describe gs://${bucketName}/${objectName} --project=${projectId} --format=json`;

      // console.log(`Executing describe command: ${command}`);
=======
      const command = `gsutil stat gs://${bucketName}/${objectName}`;
>>>>>>> 21d012a (v0.2.32)
      const { stdout, stderr } = await execPromise(command);

      if (stderr && stderr.includes("ERROR")) {
        throw new Error(stderr);
      }

      loadingToast.hide();

<<<<<<< HEAD
      const objectData = JSON.parse(stdout) as GCloudObject;
=======
      // Parse gsutil stat output
      const details: Record<string, string> = {};
      stdout.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          details[key.trim()] = valueParts.join(":").trim();
        }
      });
>>>>>>> 21d012a (v0.2.32)

      const detailsMarkdown =
        `# Object Details\n\n` +
        `**Name:** ${objectName}\n\n` +
        `**Bucket:** ${bucketName}\n\n` +
<<<<<<< HEAD
        `**Size:** ${formatFileSize(objectData.size ? parseInt(objectData.size) : 0)}\n\n` +
        `**Content Type:** ${objectData.contentType || guessContentTypeFromName(objectName)}\n\n` +
        `**Created:** ${objectData.timeCreated ? new Date(objectData.timeCreated).toLocaleString() : "Unknown"}\n\n` +
        `**Updated:** ${objectData.updated ? new Date(objectData.updated).toLocaleString() : "Unknown"}\n\n` +
        `**Storage Class:** ${objectData.storageClass || "Standard"}\n\n` +
        `**MD5 Hash:** ${objectData.md5Hash || "N/A"}\n\n`;
=======
        `**Size:** ${details["Content-Length"] || "Unknown"}\n\n` +
        `**Content Type:** ${details["Content-Type"] || guessContentTypeFromName(objectName)}\n\n` +
        `**Created:** ${details["Creation time"] || "Unknown"}\n\n` +
        `**Updated:** ${details["Update time"] || "Unknown"}\n\n` +
        `**Storage Class:** ${details["Storage class"] || "Standard"}\n\n` +
        `**Hash (md5):** ${details["Hash (md5)"] || "N/A"}\n\n`;
>>>>>>> 21d012a (v0.2.32)

      push(
        <Detail
          navigationTitle={`Object: ${objectName}`}
          markdown={detailsMarkdown}
          metadata={
            <Detail.Metadata>
              <Detail.Metadata.Label title="Name" text={objectName} />
              <Detail.Metadata.Label title="Bucket" text={bucketName} />
              <Detail.Metadata.Separator />
<<<<<<< HEAD
              <Detail.Metadata.Label
                title="Size"
                text={formatFileSize(objectData.size ? parseInt(objectData.size) : 0)}
              />
              <Detail.Metadata.Label
                title="Content Type"
                text={objectData.contentType || guessContentTypeFromName(objectName)}
              />
              <Detail.Metadata.Label title="Storage Class" text={objectData.storageClass || "Standard"} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="Created"
                text={objectData.timeCreated ? new Date(objectData.timeCreated).toLocaleString() : "Unknown"}
              />
              <Detail.Metadata.Label
                title="Updated"
                text={objectData.updated ? new Date(objectData.updated).toLocaleString() : "Unknown"}
              />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="MD5 Hash" text={objectData.md5Hash || "N/A"} />
=======
              <Detail.Metadata.Label title="Size" text={details["Content-Length"] || "Unknown"} />
              <Detail.Metadata.Label
                title="Content Type"
                text={details["Content-Type"] || guessContentTypeFromName(objectName)}
              />
              <Detail.Metadata.Label title="Storage Class" text={details["Storage class"] || "Standard"} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="Created" text={details["Creation time"] || "Unknown"} />
              <Detail.Metadata.Label title="Updated" text={details["Update time"] || "Unknown"} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="Hash (md5)" text={details["Hash (md5)"] || "N/A"} />
>>>>>>> 21d012a (v0.2.32)
            </Detail.Metadata>
          }
          actions={
            <ActionPanel>
              <Action title="Download" icon={Icon.Download} onAction={() => directDownloadObject(objectName)} />
              <Action
                title="View Versions"
                icon={Icon.Clock}
                shortcut={{ modifiers: ["cmd"], key: "v" }}
                onAction={() =>
                  push(
                    <ObjectVersionsView
                      projectId={projectId}
                      gcloudPath={gcloudPath}
                      bucketName={bucketName}
                      objectName={objectName}
                    />,
                  )
                }
              />
              <Action
                title="Delete"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => deleteObject(objectName)}
              />
              <Action
                title="Back to Objects"
                icon={Icon.ArrowLeft}
                shortcut={{ modifiers: ["cmd"], key: "b" }}
                onAction={() => pop()}
              />
              <Action
                title="Back to Buckets"
                icon={Icon.ArrowLeft}
                shortcut={{ modifiers: ["cmd", "shift"], key: "b" }}
                onAction={() => {
                  pop();
                  pop();
                }}
              />
            </ActionPanel>
          }
        />,
      );
    } catch (error: unknown) {
      loadingToast.hide();
      console.error("Error fetching object details:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch object details",
        message: errorMessage,
      });
    }
  }

  function guessContentTypeFromName(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "";

    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
      txt: "text/plain",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      xml: "application/xml",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      tar: "application/x-tar",
      gz: "application/gzip",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      webm: "video/webm",
    };

    return contentTypeMap[ext] || "application/octet-stream";
  }

<<<<<<< HEAD
=======
  function navigateToFolder(folderPath: string) {
    push(
      <StorageObjectsView
        projectId={projectId}
        gcloudPath={gcloudPath}
        bucketName={bucketName}
        currentPath={folderPath}
      />,
    );
  }

  function viewObjectVersions(objectName: string) {
    push(
      <ObjectVersionsView
        projectId={projectId}
        gcloudPath={gcloudPath}
        bucketName={bucketName}
        objectName={objectName}
      />,
    );
  }

>>>>>>> 21d012a (v0.2.32)
  if (error) {
    return (
      <List isLoading={false}>
        <List.EmptyView
          title={error}
          description="Failed to load objects"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
          actions={
            <ActionPanel>
<<<<<<< HEAD
              <Action title="Try Again" icon={Icon.RotateClockwise} onAction={fetchObjects} />
=======
              <Action title="Try Again" icon={Icon.RotateClockwise} onAction={() => fetchObjects(true)} />
              <Action title="Back to Buckets" icon={Icon.ArrowLeft} onAction={pop} />
>>>>>>> 21d012a (v0.2.32)
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
<<<<<<< HEAD
      searchBarPlaceholder="Search objects..."
      navigationTitle={`Objects in ${bucketName}`}
      isShowingDetail
=======
      searchBarPlaceholder={`Search in ${currentPath || bucketName}...`}
      navigationTitle={`${bucketName}${currentPath ? `/${currentPath}` : ""}`}
      isShowingDetail
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort By"
          storeValue={true}
          onChange={(newValue) => {
            // We'll implement sorting later
            console.log(newValue);
          }}
        >
          <List.Dropdown.Item title="Name (A-Z)" value="name_asc" />
          <List.Dropdown.Item title="Name (Z-A)" value="name_desc" />
          <List.Dropdown.Item title="Size (Largest)" value="size_desc" />
          <List.Dropdown.Item title="Size (Smallest)" value="size_asc" />
          <List.Dropdown.Item title="Modified (Newest)" value="date_desc" />
          <List.Dropdown.Item title="Modified (Oldest)" value="date_asc" />
        </List.Dropdown>
      }
>>>>>>> 21d012a (v0.2.32)
      actions={
        <ActionPanel>
          <Action
            title="Upload File"
            icon={Icon.Upload}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            onAction={selectAndUploadFile}
          />
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
<<<<<<< HEAD
            onAction={fetchObjects}
          />
=======
            onAction={() => fetchObjects(true)}
          />
          {currentPath && (
            <Action
              title="Go Up"
              icon={Icon.ArrowUp}
              shortcut={{ modifiers: ["cmd"], key: "u" }}
              onAction={() => {
                const parentPath = currentPath.split("/").slice(0, -1).join("/");
                if (parentPath) {
                  navigateToFolder(parentPath);
                } else {
                  pop();
                }
              }}
            />
          )}
>>>>>>> 21d012a (v0.2.32)
          <Action
            title="Back to Buckets"
            icon={Icon.ArrowLeft}
            shortcut={{ modifiers: ["cmd"], key: "b" }}
            onAction={pop}
          />
        </ActionPanel>
      }
    >
      {objects.length === 0 && !isLoading ? (
        <List.EmptyView
<<<<<<< HEAD
          title="No objects found"
          description={`Bucket "${bucketName}" is empty. Upload a file to get started.`}
          icon={{ source: Icon.Folder, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action
                title="Upload File"
                icon={Icon.Upload}
                shortcut={{ modifiers: ["cmd"], key: "n" }}
                onAction={selectAndUploadFile}
              />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={fetchObjects} />
              <Action
                title="Back to Buckets"
                icon={Icon.ArrowLeft}
                shortcut={{ modifiers: ["cmd"], key: "b" }}
                onAction={pop}
              />
=======
          title="This location is empty"
          description={
            currentPath
              ? `Upload files to "${currentPath}" or create new folders to organize your content.`
              : "Start by uploading files to this bucket. You can also create folders to organize your content."
          }
          icon={{ source: Icon.Folder, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action
                  title="Upload File"
                  icon={Icon.Upload}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                  onAction={selectAndUploadFile}
                />
                <Action
                  title="Create New Folder"
                  icon={Icon.NewFolder}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
                  onAction={() => {
                    // We'll implement folder creation later
                    showToast({
                      style: Toast.Style.Animated,
                      title: "Coming soon",
                      message: "Folder creation will be available in the next update",
                    });
                  }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={() => fetchObjects(true)}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
                {currentPath && (
                  <Action
                    title="Go Up"
                    icon={Icon.ArrowUp}
                    shortcut={{ modifiers: ["cmd"], key: "u" }}
                    onAction={() => {
                      const parentPath = currentPath.split("/").slice(0, -1).join("/");
                      if (parentPath) {
                        navigateToFolder(parentPath);
                      } else {
                        pop();
                      }
                    }}
                  />
                )}
                <Action
                  title="Back to Buckets"
                  icon={Icon.ArrowLeft}
                  shortcut={{ modifiers: ["cmd"], key: "b" }}
                  onAction={pop}
                />
              </ActionPanel.Section>
>>>>>>> 21d012a (v0.2.32)
            </ActionPanel>
          }
        />
      ) : (
<<<<<<< HEAD
        <List.Section title={`Objects in ${bucketName}`} subtitle={`${objects.length} objects`}>
          {objects.map((obj) => (
            <List.Item
              key={obj.id}
              title={obj.name}
              subtitle={obj.contentType}
              icon={getContentTypeIcon(obj.contentType)}
              accessories={[
                { text: obj.size, tooltip: "Size" },
                { text: new Date(obj.updated).toLocaleDateString(), tooltip: "Last Updated" },
              ]}
              detail={
                <List.Item.Detail
                  markdown={`# ${obj.name.split("/").pop() || obj.name}\n\n**Size:** ${obj.size}\n\n**Content Type:** ${obj.contentType}\n\n**Last Updated:** ${new Date(obj.updated).toLocaleString()}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Name" text={obj.name} />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Size" text={obj.size} />
                      <List.Item.Detail.Metadata.Label title="Content Type" text={obj.contentType} />
                      <List.Item.Detail.Metadata.Label
                        title="Last Updated"
                        text={new Date(obj.updated).toLocaleString()}
                      />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Bucket" text={bucketName} />
                      <List.Item.Detail.Metadata.Label title="Project" text={projectId} />
=======
        <>
          {currentPage > 1 && (
            <List.Item
              title="Previous Page"
              icon={Icon.ArrowUp}
              actions={
                <ActionPanel>
                  <Action title="Go to Previous Page" icon={Icon.ArrowUp} onAction={loadPreviousPage} />
                </ActionPanel>
              }
            />
          )}
          {objects.map((object) => (
            <List.Item
              key={object.id}
              title={object.name}
              icon={object.isFolder ? Icon.Folder : getContentTypeIcon(object.contentType)}
              accessories={[
                { text: object.isFolder ? "Folder" : object.size },
                {
                  icon: object.isFolder ? undefined : Icon.Clock,
                  tooltip: object.isFolder ? undefined : "Last Modified",
                  text: object.isFolder ? undefined : new Date(object.updated).toLocaleString(),
                },
              ]}
              detail={
                <List.Item.Detail
                  markdown={
                    object.isFolder
                      ? `# ${object.name}\n\n**Type:** Folder`
                      : `# ${object.name}\n\n**Size:** ${object.size}\n\n**Type:** ${object.contentType}\n\n**Last Modified:** ${new Date(object.updated).toLocaleString()}`
                  }
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label
                        title="Name"
                        text={object.name}
                        icon={object.isFolder ? Icon.Folder : getContentTypeIcon(object.contentType)}
                      />
                      <List.Item.Detail.Metadata.Separator />
                      {!object.isFolder && (
                        <>
                          <List.Item.Detail.Metadata.Label title="Size" text={object.size} icon={Icon.HardDrive} />
                          <List.Item.Detail.Metadata.Label
                            title="Type"
                            text={object.contentType}
                            icon={Icon.Document}
                          />
                          <List.Item.Detail.Metadata.Label
                            title="Last Modified"
                            text={new Date(object.updated).toLocaleString()}
                            icon={Icon.Clock}
                          />
                        </>
                      )}
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label
                        title="Full Path"
                        text={`gs://${bucketName}/${object.path}`}
                        icon={Icon.Link}
                      />
                      {!object.isFolder && (
                        <List.Item.Detail.Metadata.TagList title="Quick Actions">
                          <List.Item.Detail.Metadata.TagList.Item
                            text="Download"
                            color={Color.Blue}
                            icon={Icon.Download}
                          />
                          <List.Item.Detail.Metadata.TagList.Item
                            text="View Details"
                            color={Color.Green}
                            icon={Icon.Info}
                          />
                          <List.Item.Detail.Metadata.TagList.Item text="Delete" color={Color.Red} icon={Icon.Trash} />
                        </List.Item.Detail.Metadata.TagList>
                      )}
>>>>>>> 21d012a (v0.2.32)
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
<<<<<<< HEAD
                  <Action title="View Details" icon={Icon.Eye} onAction={() => viewObjectDetails(obj.name)} />
                  <Action
                    title="View Versions"
                    icon={Icon.Clock}
                    shortcut={{ modifiers: ["cmd"], key: "v" }}
                    onAction={() =>
                      push(
                        <ObjectVersionsView
                          projectId={projectId}
                          gcloudPath={gcloudPath}
                          bucketName={bucketName}
                          objectName={obj.name}
                        />,
                      )
                    }
                  />
                  <Action
                    title="Download"
                    icon={Icon.Download}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                    onAction={() => directDownloadObject(obj.name)}
                  />
                  <Action
                    title="Delete"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
                    onAction={() => deleteObject(obj.name)}
                  />
                  <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={fetchObjects} />
                  <Action
                    title="Upload File"
                    icon={Icon.Upload}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                    onAction={selectAndUploadFile}
                  />
=======
                  {object.isFolder ? (
                    <ActionPanel.Section title="Folder Actions">
                      <Action title="Open Folder" icon={Icon.Folder} onAction={() => navigateToFolder(object.path)} />
                      <Action
                        title="Upload Here"
                        icon={Icon.Upload}
                        onAction={() => {
                          push(
                            <CloudStorageUploader
                              onFilePicked={(filePath) => uploadObject(filePath)}
                              destinationInfo={`Folder: ${object.name}`}
                              title="Upload to Folder"
                            />,
                          );
                        }}
                      />
                    </ActionPanel.Section>
                  ) : (
                    <ActionPanel.Section title="Object Actions">
                      <Action
                        title="Download"
                        icon={Icon.Download}
                        shortcut={{ modifiers: ["cmd"], key: "d" }}
                        onAction={() => performDownload(object.path)}
                      />
                      <Action
                        title="View Details"
                        icon={Icon.Info}
                        shortcut={{ modifiers: ["cmd"], key: "i" }}
                        onAction={() => viewObjectDetails(object.path)}
                      />
                      <Action
                        title="View Versions"
                        icon={Icon.Clock}
                        onAction={() => viewObjectVersions(object.path)}
                      />
                      <Action
                        title="Delete"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                        onAction={() => deleteObject(object.path)}
                      />
                    </ActionPanel.Section>
                  )}
                  <ActionPanel.Section title="General">
                    <Action
                      title="Upload File"
                      icon={Icon.Upload}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                      onAction={selectAndUploadFile}
                    />
                    <Action
                      title="Refresh"
                      icon={Icon.ArrowClockwise}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                      onAction={() => fetchObjects(true)}
                    />
                    {currentPath && (
                      <Action
                        title="Go Up"
                        icon={Icon.ArrowUp}
                        shortcut={{ modifiers: ["cmd"], key: "u" }}
                        onAction={() => {
                          const parentPath = currentPath.split("/").slice(0, -1).join("/");
                          if (parentPath) {
                            navigateToFolder(parentPath);
                          } else {
                            pop();
                          }
                        }}
                      />
                    )}
                  </ActionPanel.Section>
>>>>>>> 21d012a (v0.2.32)
                </ActionPanel>
              }
            />
          ))}
<<<<<<< HEAD
        </List.Section>
=======
          {hasMore && (
            <List.Item
              title="Load More..."
              icon={Icon.Plus}
              actions={
                <ActionPanel>
                  <Action title="Load More" icon={Icon.Plus} onAction={loadNextPage} />
                </ActionPanel>
              }
            />
          )}
        </>
>>>>>>> 21d012a (v0.2.32)
      )}
    </List>
  );
}
