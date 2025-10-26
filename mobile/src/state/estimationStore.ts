import create from 'zustand';

import { NormativeCandidate, NormativeMatchInput, generateCandidates } from '@/core/workflow/generator';
import { saveProjectDraft } from '@/services/projectRepository';
import { ProjectSummary } from '@/types/project';

import { useProjectsStore } from './projectsStore';

export type EstimationStage = 'input' | 'matching' | 'review' | 'documents';

export interface EstimationState {
  stage: EstimationStage;
  input: NormativeMatchInput | null;
  candidates: NormativeCandidate[];
  selectedCandidateIds: Set<string>;
  projectSummary: ProjectSummary | null;
  setStage: (stage: EstimationStage) => void;
  submitInput: (input: NormativeMatchInput) => Promise<void>;
  toggleCandidate: (code: string) => void;
  finalizeSelection: () => Promise<void>;
  reset: () => void;
}

export const useEstimationStore = create<EstimationState>((set, get) => ({
  stage: 'input',
  input: null,
  candidates: [],
  selectedCandidateIds: new Set<string>(),
  projectSummary: null,
  setStage: (stage: EstimationStage) => set({ stage }),
  submitInput: async (input: NormativeMatchInput) => {
    const candidates = await generateCandidates(input);
    set({ input, candidates, stage: 'matching', selectedCandidateIds: new Set<string>(), projectSummary: null });
  },
  toggleCandidate: (code: string) => {
    const next = new Set<string>(get().selectedCandidateIds);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    set({ selectedCandidateIds: next });
  },
  finalizeSelection: async () => {
    const state = get();
    if (!state.input) {
      return;
    }

    const selected = state.candidates.filter((candidate: NormativeCandidate) =>
      state.selectedCandidateIds.has(candidate.code)
    );

    if (selected.length === 0) {
      return;
    }

    const summary = await saveProjectDraft(state.input, selected);
    useProjectsStore.getState().addProject(summary);
    set({ projectSummary: summary, stage: 'documents' });
  },
  reset: () =>
    set({ stage: 'input', input: null, candidates: [], selectedCandidateIds: new Set<string>(), projectSummary: null })
}));
