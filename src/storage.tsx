import { List, ActionPanel, Action, Icon, Color, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";
import { StorageBucketView } from "./services/storage";
import { CacheManager, Project } from "./utils/CacheManager";
import ProjectView from "./views/ProjectView";

const GCLOUD_PATH = "/usr/local/bin/gcloud";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { push } = useNavigation();

  useEffect(() => {
    loadLastUsedProject();
  }, []);

  async function loadLastUsedProject() {
    try {
      const cachedProject = CacheManager.getSelectedProject();
      if (cachedProject) {
        const projectDetails = await CacheManager.getProjectDetails(cachedProject.projectId, GCLOUD_PATH);
        if (projectDetails) {
          setSelectedProject(projectDetails);
        }
      }
    } catch (error) {
      console.error("Error loading last used project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!selectedProject) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView
          title="No Project Selected"
          description="Please select a project to continue"
          icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
          actions={
            <ActionPanel>
              <Action
                title="Select Project"
                icon={Icon.List}
                onAction={() => push(<ProjectView projectId="" gcloudPath={GCLOUD_PATH} />)}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return <StorageBucketView projectId={selectedProject.id} gcloudPath={GCLOUD_PATH} />;
}
