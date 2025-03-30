import { useState, useEffect } from "react";
import { List } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { CacheManager, Project } from "../utils/CacheManager";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

interface ProjectQuickSwitcherProps {
  projectId: string;
  gcloudPath: string;
  onProjectChange: (projectId: string) => void;
}

interface GCloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
  createTime?: string;
}

export default function ProjectQuickSwitcher({ projectId, gcloudPath, onProjectChange }: ProjectQuickSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId !== projectId) {
      onProjectChange(selectedProjectId);
    }
  }, [selectedProjectId]);

  async function loadProjects() {
    try {
      const cachedProjects = CacheManager.getProjectsList();
      if (cachedProjects) {
        setProjects(cachedProjects.projects);
      } else {
        const { stdout } = await execPromise(`${gcloudPath} projects list --format=json`);
        const projectsData = JSON.parse(stdout);
        const formattedProjects = projectsData.map((project: GCloudProject) => ({
          id: project.projectId,
          name: project.name,
          projectNumber: project.projectNumber,
          createTime: project.createTime || new Date().toISOString(),
        }));
        setProjects(formattedProjects);
        CacheManager.saveProjectsList(formattedProjects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      showFailureToast(error, {
        title: "Failed to load projects",
      });
    }
  }

  return (
    <List.Dropdown tooltip="Select Project" value={selectedProjectId} onChange={setSelectedProjectId}>
      {projects.map((project) => (
        <List.Dropdown.Item key={project.id} title={project.name} value={project.id} />
      ))}
    </List.Dropdown>
  );
}
