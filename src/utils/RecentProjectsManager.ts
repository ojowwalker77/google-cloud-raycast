import { LocalStorage } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { Project } from "./CacheManager";

const STORAGE_KEYS = {
  RECENT_PROJECTS: "recent-projects",
  RECENT_PROJECTS_LIMIT: "recent-projects-limit",
};

const DEFAULT_RECENT_PROJECTS_LIMIT = 5;

export interface RecentProject {
  id: string;
  name: string;
  lastUsedAt: number;
}

export class RecentProjectsManager {
  static async getRecentProjects(): Promise<RecentProject[]> {
    try {
      const stored = await LocalStorage.getItem<string>(STORAGE_KEYS.RECENT_PROJECTS);
      if (!stored) return [];

      const projects = JSON.parse(stored) as RecentProject[];
      return projects.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    } catch (error) {
      console.error("Failed to get recent projects:", error);
      showFailureToast("Failed to get recent projects", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  static async addRecentProject(project: Project): Promise<void> {
    if (!project?.id) {
      console.error("Invalid project:", project);
      return;
    }

    try {
      const limit = await this.getLimit();
      const recentProjects = await this.getRecentProjects();

      const now = Date.now();
      const existingIndex = recentProjects.findIndex((p) => p.id === project.id);

      if (existingIndex !== -1) {
        // Update existing project's timestamp
        recentProjects[existingIndex].lastUsedAt = now;
      } else {
        // Add new project
        recentProjects.unshift({
          id: project.id,
          name: project.name || project.id,
          lastUsedAt: now,
        });
      }

      // Keep only the most recent projects up to the limit
      const updatedProjects = recentProjects.sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, limit);

      await LocalStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error("Failed to add recent project:", error);
      showFailureToast("Failed to add recent project", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async removeRecentProject(projectId: string): Promise<void> {
    try {
      const recentProjects = await this.getRecentProjects();
      const updatedProjects = recentProjects.filter((p) => p.id !== projectId);
      await LocalStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error("Failed to remove recent project:", error);
      showFailureToast("Failed to remove recent project", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async clearRecentProjects(): Promise<void> {
    try {
      await LocalStorage.removeItem(STORAGE_KEYS.RECENT_PROJECTS);
    } catch (error) {
      console.error("Failed to clear recent projects:", error);
      showFailureToast("Failed to clear recent projects", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async setLimit(limit: number): Promise<void> {
    if (limit < 1) {
      console.error("Invalid limit:", limit);
      return;
    }

    try {
      await LocalStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS_LIMIT, limit.toString());
      // Trim existing projects to new limit
      const recentProjects = await this.getRecentProjects();
      if (recentProjects.length > limit) {
        const trimmedProjects = recentProjects.slice(0, limit);
        await LocalStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS, JSON.stringify(trimmedProjects));
      }
    } catch (error) {
      console.error("Failed to set recent projects limit:", error);
      showFailureToast("Failed to set recent projects limit", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getLimit(): Promise<number> {
    try {
      const stored = await LocalStorage.getItem<string>(STORAGE_KEYS.RECENT_PROJECTS_LIMIT);
      if (!stored) return DEFAULT_RECENT_PROJECTS_LIMIT;

      const limit = parseInt(stored, 10);
      return isNaN(limit) ? DEFAULT_RECENT_PROJECTS_LIMIT : limit;
    } catch (error) {
      console.error("Failed to get recent projects limit:", error);
      return DEFAULT_RECENT_PROJECTS_LIMIT;
    }
  }
}
