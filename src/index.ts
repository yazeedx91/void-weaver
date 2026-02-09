// Psychometric Neural Engine - Main Export File
// This file serves as the central entry point for the entire psychometric system

// Core Types and Interfaces
export type {
  HEXACOResponse,
  DASSResponse,
  HEXACOScores,
  DASSScores,
  StabilityFlags,
  PsychometricProfile,
  ScoringInput,
  ScoringOutput,
  HEXACOItem,
  DASSItem,
  ValidationError,
  ValidationResult,
  PsychometricState,
} from './types/psychometric';

// Validation System
export {
  PsychometricValidator,
  hexacoResponseSchema,
  dassResponseSchema,
  psychometricResponseSchema,
  hexacoResponsesArraySchema,
  dassResponsesArraySchema,
  psychometricProfileSchema,
} from './validation/psychometricSchemas';

// Scoring Algorithms
export {
  ScoringAlgorithm,
  HEXACO_ITEMS,
  DASS_ITEMS,
  TEIQUE_ITEMS,
} from './algorithms/ScoringAlgorithm';

// State Management
export {
  usePsychometricStore,
  useHexacoResponses,
  useDassResponses,
  useTeiqueResponses,
  useHexacoScores,
  useDassScores,
  useTeiqueScores,
  useStabilityFlags,
  useProgress,
  useCurrentQuestion,
  useAssessmentStatus,
} from './store/PsychometricProvider';

// Re-export for convenience
export type { ExtendedPsychometricState } from './store/PsychometricProvider';
