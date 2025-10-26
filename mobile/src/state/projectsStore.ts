import create from 'zustand';

import { listProjects } from '@/services/projectRepository';
import { ProjectSummary } from '@/types/project';

interface ProjectsState {
  projects: ProjectSummary[];
  loadProjects: () => Promise<void>;
  addProject: (project: ProjectSummary) => void;
  removeProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loadProjects: async () => {
    try {
      const projects = await listProjects();
      set({ projects });
    } catch (error) {
      console.error('Failed to load projects', error);
    }
  },
  addProject: (project: ProjectSummary) =>
    set((state: ProjectsState) => ({
      projects: [project, ...state.projects.filter((existing: ProjectSummary) => existing.id !== project.id)]
    })),
  removeProject: (id: string) =>
    set((state: ProjectsState) => ({
      projects: state.projects.filter((project: ProjectSummary) => project.id !== id)
    }))
}));
