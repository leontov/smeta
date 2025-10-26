export type CalculationMethod = 'resource' | 'base-index';

export interface ProjectSettings {
  calculationMethod: CalculationMethod;
  region?: string | null;
  indexProfile?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  itemsCount: number;
  settings: ProjectSettings;
}

export interface ProjectNorm {
  code: string;
  title: string;
  collection: string;
  orderIndex: number;
}

export interface ProjectDetail extends ProjectSummary {
  norms: ProjectNorm[];
}
