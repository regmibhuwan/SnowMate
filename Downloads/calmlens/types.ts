export interface NormalPerspective {
  baselineBehavior: string;
  alternativeInterpretation: string;
  reactionDifference: string;
  supportiveMessage: string;
}

export interface AnalysisResult {
  anxietyLevel: number; // 0-10 extracted or refined by AI
  symptoms: string[];
  thoughts: string[];
  triggers: string[];
  emotions: string[];
  normalPerspective: NormalPerspective;
}

export interface SituationLog {
  id: string;
  timestamp: number;
  description: string;
  userSelfRating: number; // User's initial slider value
  analysis: AnalysisResult | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChartDataPoint {
  name: string;
  value: number;
}