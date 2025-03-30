import { useEffect } from "react";
import { useNavigation } from "@raycast/api";
import { CacheManager } from "./utils/CacheManager";
import { ComputeInstancesView } from "./services/compute";

const GCLOUD_PATH = "/usr/local/bin/gcloud";

export default function Command() {
  const { push } = useNavigation();

  useEffect(() => {
    const loadLastProject = async () => {
      try {
        const cachedProject = CacheManager.getSelectedProject();
        if (cachedProject) {
          push(<ComputeInstancesView projectId={cachedProject.projectId} gcloudPath={GCLOUD_PATH} />);
        }
      } catch (error) {
        console.error("Error loading last project:", error);
      }
    };

    loadLastProject();
  }, [push]);

  return null;
}
