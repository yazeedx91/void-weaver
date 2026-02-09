// HEXACO-60 Response Types
export interface HEXACOResponse {
  id: number;
  response: number; // 1-5 Likert scale
}

export interface HEXACOScores {
  HonestyHumility: number;
  Emotionality: number;
  Extraversion: number;
  Agreeableness: number;
  Conscientiousness: number;
  OpennessToExperience: number;
}

// DASS-21 Response Types
export interface DASSResponse {
  id: number;
  response: number; // 0-3 Likert scale (0=Never, 1=Sometimes, 2=Often, 3=Almost Always)
}

export interface DASSScores {
  Depression: number;
  Anxiety: number;
  Stress: number;
}

// TEIQue-SF Response Types
export interface TEIQueResponse {
  id: number;
  response: number; // 1-7 Likert scale
}

export interface TEIQueScores {
  Wellbeing: number;
  SelfControl: number;
  Emotionality: number;
  Sociability: number;
  GlobalEI: number;
}

// Stability Index Types
export interface StabilityFlags {
  acuteReactiveState: boolean;
  highFunctioningBurnout: boolean;
  emotionalDysregulation: boolean;
  overallStability: 'Stable' | 'At Risk' | 'Critical';
}

// Complete Psychometric Profile
export interface PsychometricProfile {
  hexacoResponses: HEXACOResponse[];
  dassResponses: DASSResponse[];
  teiqueResponses: TEIQueResponse[];
  hexacoScores: HEXACOScores;
  dassScores: DASSScores;
  teiqueScores: TEIQueScores;
  stabilityFlags: StabilityFlags;
  completedAt: Date | null;
  lastUpdated: Date | null;
  isValid: boolean;
}

// Scoring Algorithm Input/Output
export interface ScoringInput {
  hexacoResponses: HEXACOResponse[];
  dassResponses: DASSResponse[];
  teiqueResponses?: TEIQueResponse[];
}

export interface ScoringOutput {
  hexacoScores: HEXACOScores;
  dassScores: DASSScores;
  teiqueScores?: TEIQueScores;
  stabilityFlags: StabilityFlags;
}

// Store State Interface
export interface PsychometricState {
  hexacoResponses: HEXACOResponse[];
  dassResponses: DASSResponse[];
  teiqueResponses: TEIQueResponse[];
  hexacoScores: HEXACOScores | null;
  dassScores: DASSScores | null;
  teiqueScores: TEIQueScores | null;
  stabilityFlags: StabilityFlags | null;
  currentScale: 'hexaco' | 'dass' | 'teique' | null;
  currentQuestion: number;
  isComplete: boolean;
  isValid: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  lastUpdated: Date | null;
  setHexacoResponse: (id: number, response: number) => void;
  setDassResponse: (id: number, response: number) => void;
  setTeiqueResponse: (id: number, response: number) => void;
  calculateScores: () => void;
  resetAssessment: () => void;
  setCurrentScale: (scale: 'hexaco' | 'dass' | 'teique') => void;
  setCurrentQuestion: (question: number) => void;
  validateResponses: () => boolean;
}

// HEXACO-60 Item Configuration
export interface HEXACOItem {
  id: number;
  facet: keyof HEXACOScores;
  text: string;
  reverseCoded: boolean;
  category: string;
  scoring_weight: number;
}

// DASS-21 Item Configuration  
export interface DASSItem {
  id: number;
  scale: keyof DASSScores;
  text: string;
  category: string;
  scoring_weight: number;
}

// TEIQue-SF Item Configuration
export interface TEIQueItem {
  id: number;
  factor: keyof Omit<TEIQueScores, 'GlobalEI'>;
  text: string;
  reverseCoded: boolean;
  category: string;
  scoring_weight: number;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
