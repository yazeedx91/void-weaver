import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  PsychometricState, 
  HEXACOResponse, 
  DASSResponse, 
  TEIQueResponse,
  HEXACOScores, 
  DASSScores, 
  TEIQueScores,
  StabilityFlags,
  PsychometricProfile 
} from '../types/psychometric';
import { PsychometricValidator } from '../validation/psychometricSchemas';
import { ScoringAlgorithm } from '../algorithms/ScoringAlgorithm';

// Initial state for HEXACO responses (60 items)
const initialHexacoResponses: HEXACOResponse[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  response: -1, // -1 indicates unanswered
}));

// Initial state for DASS responses (21 items)
const initialDassResponses: DASSResponse[] = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  response: -1, // -1 indicates unanswered
}));

// Initial state for TEIQue responses (30 items)
const initialTeiqueResponses: TEIQueResponse[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  response: -1, // -1 indicates unanswered
}));

export interface ExtendedPsychometricState extends PsychometricState {
  // Additional computed states
  hexacoProgress: number; // 0-100
  dassProgress: number;  // 0-100
  teiqueProgress: number; // 0-100
  totalProgress: number; // 0-100
  
  // Response validity tracking
  hexacoResponseValidity: boolean[];
  dassResponseValidity: boolean[];
  teiqueResponseValidity: boolean[];
  
  // Scoring cache
  lastScoredAt: Date | null;
  scoringCache: {
    hexacoScores: HEXACOScores | null;
    dassScores: DASSScores | null;
    teiqueScores: TEIQueScores | null;
    stabilityFlags: StabilityFlags | null;
  };
  
  // Assessment flow control
  currentSection: 'intro' | 'hexaco' | 'dass' | 'teique' | 'results' | 'complete';
  showValidationErrors: boolean;
  
  // Advanced analytics
  responseTimes: number[]; // Response time for each question in milliseconds
  averageResponseTime: number;
  
  // Export/Import functionality
  exportProfile: () => PsychometricProfile | null;
  importProfile: (profile: PsychometricProfile) => boolean;
  
  // Batch operations
  setHexacoResponsesBatch: (responses: { id: number; response: number }[]) => void;
  setDassResponsesBatch: (responses: { id: number; response: number }[]) => void;
  setTeiqueResponsesBatch: (responses: { id: number; response: number }[]) => void;
  
  // Advanced validation
  validateAllResponses: () => { isValid: boolean; errors: string[] };
  getUnansweredQuestions: () => { hexaco: number[]; dass: number[]; teique: number[] };
  
  // Progress tracking
  markQuestionAsAnswered: (scale: 'hexaco' | 'dass' | 'teique', questionId: number) => void;
  markQuestionAsUnanswered: (scale: 'hexaco' | 'dass' | 'teique', questionId: number) => void;
  
  // State persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearLocalStorage: () => void;
}

export const usePsychometricStore = create<ExtendedPsychometricState>()(
  devtools(
    (set, get) => ({
      // Basic state
      hexacoResponses: initialHexacoResponses,
      dassResponses: initialDassResponses,
      teiqueResponses: initialTeiqueResponses,
      hexacoScores: null,
      dassScores: null,
      teiqueScores: null,
      stabilityFlags: null,
      currentScale: null,
      currentQuestion: 1,
      isComplete: false,
      isValid: false,
      startedAt: null,
      completedAt: null,
      lastUpdated: null,

      // Extended state
      hexacoProgress: 0,
      dassProgress: 0,
      teiqueProgress: 0,
      totalProgress: 0,
      hexacoResponseValidity: Array(60).fill(false),
      dassResponseValidity: Array(21).fill(false),
      teiqueResponseValidity: Array(30).fill(false),
      lastScoredAt: null,
      scoringCache: {
        hexacoScores: null,
        dassScores: null,
        teiqueScores: null,
        stabilityFlags: null,
      },
      currentSection: 'intro',
      showValidationErrors: false,
      responseTimes: Array(111).fill(0), // 60 + 21 + 30 = 111 total questions
      averageResponseTime: 0,

      // Basic setters
      setHexacoResponse: (id: number, response: number) => {
        const startTime = Date.now();
        
        set((state) => {
          // Validate response
          const validation = PsychometricValidator.validateResponseValue(response, 'hexaco');
          const idValidation = PsychometricValidator.validateQuestionId(id, 'hexaco');
          
          if (!validation.isValid || !idValidation.isValid) {
            if (state.showValidationErrors && process.env.NODE_ENV !== 'production') {
              console.error('Invalid HEXACO response:', { id, response, validation, idValidation });
            }
            return state;
          }

          const newResponses = [...state.hexacoResponses];
          const index = newResponses.findIndex(r => r.id === id);
          
          if (index !== -1) {
            newResponses[index] = { id, response };
            
            // Update validity
            const newValidity = [...state.hexacoResponseValidity];
            newValidity[index] = true;
            
            // Update response time
            const newResponseTimes = [...state.responseTimes];
            const questionIndex = id - 1; // HEXACO questions are 1-60
            if (newResponseTimes[questionIndex] === 0) {
              newResponseTimes[questionIndex] = Date.now() - startTime;
            }
            
            // Calculate progress
            const answeredCount = newResponses.filter(r => r.response >= 0).length;
            const progress = (answeredCount / 60) * 100;
            
            return {
              hexacoResponses: newResponses,
              hexacoResponseValidity: newValidity,
              hexacoProgress: progress,
              totalProgress: (progress + state.dassProgress + state.teiqueProgress) / 3,
              lastUpdated: new Date(),
              responseTimes: newResponseTimes,
            };
          }
          
          return state;
        });
      },

      setDassResponse: (id: number, response: number) => {
        const startTime = Date.now();
        
        set((state) => {
          // Validate response
          const validation = PsychometricValidator.validateResponseValue(response, 'dass');
          const idValidation = PsychometricValidator.validateQuestionId(id, 'dass');
          
          if (!validation.isValid || !idValidation.isValid) {
            if (state.showValidationErrors && process.env.NODE_ENV !== 'production') {
              console.error('Invalid DASS response:', { id, response, validation, idValidation });
            }
            return state;
          }

          const newResponses = [...state.dassResponses];
          const index = newResponses.findIndex(r => r.id === id);
          
          if (index !== -1) {
            newResponses[index] = { id, response };
            
            // Update validity
            const newValidity = [...state.dassResponseValidity];
            newValidity[index] = true;
            
            // Update response time
            const newResponseTimes = [...state.responseTimes];
            const questionIndex = 60 + (id - 1); // DASS questions start after HEXACO (60-80)
            if (newResponseTimes[questionIndex] === 0) {
              newResponseTimes[questionIndex] = Date.now() - startTime;
            }
            
            // Calculate progress
            const answeredCount = newResponses.filter(r => r.response >= 0).length;
            const progress = (answeredCount / 21) * 100;
            
            return {
              dassResponses: newResponses,
              dassResponseValidity: newValidity,
              dassProgress: progress,
              totalProgress: (state.hexacoProgress + progress + state.teiqueProgress) / 3,
              lastUpdated: new Date(),
              responseTimes: newResponseTimes,
            };
          }
          
          return state;
        });
      },

      setTeiqueResponse: (id: number, response: number) => {
        const startTime = Date.now();
        
        set((state) => {
          const validation = PsychometricValidator.validateResponseValue(response, 'teique');
          const idValidation = PsychometricValidator.validateQuestionId(id, 'teique');
          
          if (!validation.isValid || !idValidation.isValid) {
            if (state.showValidationErrors && process.env.NODE_ENV !== 'production') {
              console.error('Invalid TEIQue response:', { id, response, validation, idValidation });
            }
            return state;
          }

          const newResponses = [...state.teiqueResponses];
          const index = newResponses.findIndex(r => r.id === id);
          
          if (index !== -1) {
            newResponses[index] = { id, response };
            
            const newValidity = [...state.teiqueResponseValidity];
            newValidity[index] = true;
            
            const newResponseTimes = [...state.responseTimes];
            const questionIndex = 60 + 21 + (id - 1); // TEIQue questions start after HEXACO+DASS (81-110)
            if (newResponseTimes[questionIndex] === 0) {
              newResponseTimes[questionIndex] = Date.now() - startTime;
            }
            
            const answeredCount = newResponses.filter(r => r.response >= 0).length;
            const progress = (answeredCount / 30) * 100;
            
            return {
              teiqueResponses: newResponses,
              teiqueResponseValidity: newValidity,
              teiqueProgress: progress,
              totalProgress: (state.hexacoProgress + state.dassProgress + progress) / 3,
              lastUpdated: new Date(),
              responseTimes: newResponseTimes,
            };
          }
          
          return state;
        });
      },

      setHexacoResponses: (responses: HEXACOResponse[]) => {
        set((state) => {
          try {
            PsychometricValidator.validateHexacoResponses(responses);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.error('Invalid HEXACO responses array:', error);
            return state;
          }

          const validity = responses.map(r => r.response >= 0);
          const answeredCount = responses.filter(r => r.response >= 0).length;
          const progress = (answeredCount / 60) * 100;

          return {
            hexacoResponses: responses,
            hexacoResponseValidity: validity,
            hexacoProgress: progress,
            totalProgress: (progress + state.dassProgress + state.teiqueProgress) / 3,
            lastUpdated: new Date(),
          };
        });
      },

      setDassResponses: (responses: DASSResponse[]) => {
        set((state) => {
          try {
            PsychometricValidator.validateDassResponses(responses);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.error('Invalid DASS responses array:', error);
            return state;
          }

          const validity = responses.map(r => r.response >= 0);
          const answeredCount = responses.filter(r => r.response >= 0).length;
          const progress = (answeredCount / 21) * 100;

          return {
            dassResponses: responses,
            dassResponseValidity: validity,
            dassProgress: progress,
            totalProgress: (state.hexacoProgress + progress + state.teiqueProgress) / 3,
            lastUpdated: new Date(),
          };
        });
      },

      calculateScores: () => {
        set((state) => {
          const validTeiqueResponses = state.teiqueResponses.filter(r => r.response >= 0);
          const completeness = ScoringAlgorithm.validateResponseCompleteness(
            state.hexacoResponses.filter(r => r.response >= 0),
            state.dassResponses.filter(r => r.response >= 0),
            validTeiqueResponses
          );

          if (!completeness.isComplete) {
            return state;
          }

          try {
            const validHexacoResponses = state.hexacoResponses.filter(r => r.response >= 0);
            const validDassResponses = state.dassResponses.filter(r => r.response >= 0);

            const scores = ScoringAlgorithm.calculateScores({
              hexacoResponses: validHexacoResponses,
              dassResponses: validDassResponses,
              teiqueResponses: validTeiqueResponses,
            });

            const isNowComplete = completeness.isHexacoComplete && completeness.isDassComplete && completeness.isTeiqueComplete;

            return {
              hexacoScores: scores.hexacoScores,
              dassScores: scores.dassScores,
              teiqueScores: scores.teiqueScores || null,
              stabilityFlags: scores.stabilityFlags,
              scoringCache: {
                hexacoScores: scores.hexacoScores,
                dassScores: scores.dassScores,
                teiqueScores: scores.teiqueScores || null,
                stabilityFlags: scores.stabilityFlags,
              },
              lastScoredAt: new Date(),
              isComplete: isNowComplete,
              completedAt: isNowComplete ? new Date() : state.completedAt,
              isValid: true,
            };
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.error('Error calculating scores:', error);
            return {
              ...state,
              isValid: false,
            };
          }
        });
      },

      resetAssessment: () => {
        set({
          hexacoResponses: initialHexacoResponses,
          dassResponses: initialDassResponses,
          teiqueResponses: initialTeiqueResponses,
          hexacoScores: null,
          dassScores: null,
          teiqueScores: null,
          stabilityFlags: null,
          currentScale: null,
          currentQuestion: 1,
          isComplete: false,
          isValid: false,
          startedAt: null,
          completedAt: null,
          lastUpdated: null,
          hexacoProgress: 0,
          dassProgress: 0,
          teiqueProgress: 0,
          totalProgress: 0,
          hexacoResponseValidity: Array(60).fill(false),
          dassResponseValidity: Array(21).fill(false),
          teiqueResponseValidity: Array(30).fill(false),
          lastScoredAt: null,
          scoringCache: {
            hexacoScores: null,
            dassScores: null,
            teiqueScores: null,
            stabilityFlags: null,
          },
          currentSection: 'intro',
          showValidationErrors: false,
          responseTimes: Array(111).fill(0),
          averageResponseTime: 0,
        });
      },

      setCurrentScale: (scale: 'hexaco' | 'dass' | 'teique') => {
        set((state) => ({
          currentScale: scale,
          currentQuestion: 1,
          startedAt: state.startedAt || new Date(),
          lastUpdated: new Date(),
        }));
      },

      setCurrentQuestion: (question: number) => {
        set((state) => ({
          currentQuestion: question,
          lastUpdated: new Date(),
        }));
      },

      validateResponses: () => {
        const state = get();
        const validation = PsychometricValidator.validateCompleteResponses(
          state.hexacoResponses,
          state.dassResponses
        );
        
        set({ isValid: validation.isValid });
        return validation.isValid;
      },

      // Extended functionality
      exportProfile: () => {
        const state = get();
        
        if (!state.isComplete || !state.hexacoScores || !state.dassScores || !state.teiqueScores || !state.stabilityFlags) {
          return null;
        }

        return {
          hexacoResponses: state.hexacoResponses,
          dassResponses: state.dassResponses,
          teiqueResponses: state.teiqueResponses,
          hexacoScores: state.hexacoScores,
          dassScores: state.dassScores,
          teiqueScores: state.teiqueScores,
          stabilityFlags: state.stabilityFlags,
          completedAt: state.completedAt,
          lastUpdated: state.lastUpdated,
          isValid: state.isValid,
        };
      },

      importProfile: (profile: PsychometricProfile) => {
        try {
          const validation = PsychometricValidator.validateCompleteProfile(profile);
          
          if (!validation) {
            if (process.env.NODE_ENV !== 'production') console.error('Invalid profile format');
            return false;
          }

          const hexacoValidity = profile.hexacoResponses.map(r => r.response >= 0);
          const dassValidity = profile.dassResponses.map(r => r.response >= 0);
          const teiqueValidity = profile.teiqueResponses.map(r => r.response >= 0);
          
          const hexacoAnswered = profile.hexacoResponses.filter(r => r.response >= 0).length;
          const dassAnswered = profile.dassResponses.filter(r => r.response >= 0).length;
          const teiqueAnswered = profile.teiqueResponses.filter(r => r.response >= 0).length;
          
          const hexacoProgress = (hexacoAnswered / 60) * 100;
          const dassProgress = (dassAnswered / 21) * 100;
          const teiqueProgress = (teiqueAnswered / 30) * 100;

          set({
            hexacoResponses: profile.hexacoResponses,
            dassResponses: profile.dassResponses,
            teiqueResponses: profile.teiqueResponses,
            hexacoScores: profile.hexacoScores,
            dassScores: profile.dassScores,
            teiqueScores: profile.teiqueScores,
            stabilityFlags: profile.stabilityFlags,
            hexacoResponseValidity: hexacoValidity,
            dassResponseValidity: dassValidity,
            teiqueResponseValidity: teiqueValidity,
            hexacoProgress,
            dassProgress,
            teiqueProgress,
            totalProgress: (hexacoProgress + dassProgress + teiqueProgress) / 3,
            completedAt: profile.completedAt,
            lastUpdated: profile.lastUpdated,
            isValid: profile.isValid,
            isComplete: hexacoAnswered === 60 && dassAnswered === 21 && teiqueAnswered === 30,
            scoringCache: {
              hexacoScores: profile.hexacoScores,
              dassScores: profile.dassScores,
              teiqueScores: profile.teiqueScores,
              stabilityFlags: profile.stabilityFlags,
            },
          });

          return true;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') console.error('Error importing profile:', error);
          return false;
        }
      },

      setHexacoResponsesBatch: (responses: { id: number; response: number }[]) => {
        set((state) => {
          const newResponses = [...state.hexacoResponses];
          const newValidity = [...state.hexacoResponseValidity];
          
          responses.forEach(({ id, response }) => {
            const validation = PsychometricValidator.validateResponseValue(response, 'hexaco');
            const idValidation = PsychometricValidator.validateQuestionId(id, 'hexaco');
            
            if (validation.isValid && idValidation.isValid) {
              const index = newResponses.findIndex(r => r.id === id);
              if (index !== -1) {
                newResponses[index] = { id, response };
                newValidity[index] = response >= 0;
              }
            }
          });
          
          const answeredCount = newResponses.filter(r => r.response >= 0).length;
          const progress = (answeredCount / 60) * 100;

          return {
            hexacoResponses: newResponses,
            hexacoResponseValidity: newValidity,
            hexacoProgress: progress,
            totalProgress: (progress + state.dassProgress + state.teiqueProgress) / 3,
            lastUpdated: new Date(),
          };
        });
      },

      setDassResponsesBatch: (responses: { id: number; response: number }[]) => {
        set((state) => {
          const newResponses = [...state.dassResponses];
          const newValidity = [...state.dassResponseValidity];
          
          responses.forEach(({ id, response }) => {
            const validation = PsychometricValidator.validateResponseValue(response, 'dass');
            const idValidation = PsychometricValidator.validateQuestionId(id, 'dass');
            
            if (validation.isValid && idValidation.isValid) {
              const index = newResponses.findIndex(r => r.id === id);
              if (index !== -1) {
                newResponses[index] = { id, response };
                newValidity[index] = response >= 0;
              }
            }
          });
          
          const answeredCount = newResponses.filter(r => r.response >= 0).length;
          const progress = (answeredCount / 21) * 100;

          return {
            dassResponses: newResponses,
            dassResponseValidity: newValidity,
            dassProgress: progress,
            totalProgress: (state.hexacoProgress + progress + state.teiqueProgress) / 3,
            lastUpdated: new Date(),
          };
        });
      },

      setTeiqueResponsesBatch: (responses: { id: number; response: number }[]) => {
        set((state) => {
          const newResponses = [...state.teiqueResponses];
          const newValidity = [...state.teiqueResponseValidity];
          
          responses.forEach(({ id, response }) => {
            const validation = PsychometricValidator.validateResponseValue(response, 'teique');
            const idValidation = PsychometricValidator.validateQuestionId(id, 'teique');
            
            if (validation.isValid && idValidation.isValid) {
              const index = newResponses.findIndex(r => r.id === id);
              if (index !== -1) {
                newResponses[index] = { id, response };
                newValidity[index] = response >= 0;
              }
            }
          });
          
          const answeredCount = newResponses.filter(r => r.response >= 0).length;
          const progress = (answeredCount / 30) * 100;

          return {
            teiqueResponses: newResponses,
            teiqueResponseValidity: newValidity,
            teiqueProgress: progress,
            totalProgress: (state.hexacoProgress + state.dassProgress + progress) / 3,
            lastUpdated: new Date(),
          };
        });
      },

      validateAllResponses: () => {
        const state = get();
        const errors: string[] = [];

        state.hexacoResponses.forEach((response, index) => {
          if (response.response < 0 || response.response > 5) {
            errors.push(`HEXACO Question ${response.id}: Invalid response value ${response.response}`);
          }
        });

        state.dassResponses.forEach((response, index) => {
          if (response.response < 0 || response.response > 3) {
            errors.push(`DASS Question ${response.id}: Invalid response value ${response.response}`);
          }
        });

        state.teiqueResponses.forEach((response, index) => {
          if (response.response < 0 || response.response > 7) {
            errors.push(`TEIQue Question ${response.id}: Invalid response value ${response.response}`);
          }
        });

        const isValid = errors.length === 0;
        set({ isValid });
        
        return { isValid, errors };
      },

      getUnansweredQuestions: () => {
        const state = get();
        const hexaco = state.hexacoResponses
          .filter(r => r.response < 0)
          .map(r => r.id);
        const dass = state.dassResponses
          .filter(r => r.response < 0)
          .map(r => r.id);
        const teique = state.teiqueResponses
          .filter(r => r.response < 0)
          .map(r => r.id);
        
        return { hexaco, dass, teique };
      },

      markQuestionAsAnswered: (scale: 'hexaco' | 'dass' | 'teique', questionId: number) => {
        set((state) => {
          if (scale === 'hexaco') {
            const newValidity = [...state.hexacoResponseValidity];
            const index = questionId - 1;
            if (index >= 0 && index < 60) {
              newValidity[index] = true;
              return { hexacoResponseValidity: newValidity };
            }
          } else if (scale === 'dass') {
            const newValidity = [...state.dassResponseValidity];
            const index = questionId - 1;
            if (index >= 0 && index < 21) {
              newValidity[index] = true;
              return { dassResponseValidity: newValidity };
            }
          } else if (scale === 'teique') {
            const newValidity = [...state.teiqueResponseValidity];
            const index = questionId - 1;
            if (index >= 0 && index < 30) {
              newValidity[index] = true;
              return { teiqueResponseValidity: newValidity };
            }
          }
          return state;
        });
      },

      markQuestionAsUnanswered: (scale: 'hexaco' | 'dass' | 'teique', questionId: number) => {
        set((state) => {
          if (scale === 'hexaco') {
            const newValidity = [...state.hexacoResponseValidity];
            const newResponses = [...state.hexacoResponses];
            const index = questionId - 1;
            
            if (index >= 0 && index < 60) {
              newValidity[index] = false;
              newResponses[index] = { id: questionId, response: -1 };
              
              const answeredCount = newResponses.filter(r => r.response >= 0).length;
              const progress = (answeredCount / 60) * 100;
              
              return {
                hexacoResponseValidity: newValidity,
                hexacoResponses: newResponses,
                hexacoProgress: progress,
                totalProgress: (progress + state.dassProgress + state.teiqueProgress) / 3,
                lastUpdated: new Date(),
              };
            }
          } else if (scale === 'dass') {
            const newValidity = [...state.dassResponseValidity];
            const newResponses = [...state.dassResponses];
            const index = questionId - 1;
            
            if (index >= 0 && index < 21) {
              newValidity[index] = false;
              newResponses[index] = { id: questionId, response: -1 };
              
              const answeredCount = newResponses.filter(r => r.response >= 0).length;
              const progress = (answeredCount / 21) * 100;
              
              return {
                dassResponseValidity: newValidity,
                dassResponses: newResponses,
                dassProgress: progress,
                totalProgress: (state.hexacoProgress + progress + state.teiqueProgress) / 3,
                lastUpdated: new Date(),
              };
            }
          } else if (scale === 'teique') {
            const newValidity = [...state.teiqueResponseValidity];
            const newResponses = [...state.teiqueResponses];
            const index = questionId - 1;
            
            if (index >= 0 && index < 30) {
              newValidity[index] = false;
              newResponses[index] = { id: questionId, response: -1 };
              
              const answeredCount = newResponses.filter(r => r.response >= 0).length;
              const progress = (answeredCount / 30) * 100;
              
              return {
                teiqueResponseValidity: newValidity,
                teiqueResponses: newResponses,
                teiqueProgress: progress,
                totalProgress: (state.hexacoProgress + state.dassProgress + progress) / 3,
                lastUpdated: new Date(),
              };
            }
          }
          return state;
        });
      },

      saveToLocalStorage: () => {
        try {
          const state = get();
          const dataToSave = {
            hexacoResponses: state.hexacoResponses,
            dassResponses: state.dassResponses,
            teiqueResponses: state.teiqueResponses,
            hexacoScores: state.hexacoScores,
            dassScores: state.dassScores,
            teiqueScores: state.teiqueScores,
            stabilityFlags: state.stabilityFlags,
            currentScale: state.currentScale,
            currentQuestion: state.currentQuestion,
            isComplete: state.isComplete,
            isValid: state.isValid,
            startedAt: state.startedAt,
            completedAt: state.completedAt,
            lastUpdated: state.lastUpdated,
            hexacoProgress: state.hexacoProgress,
            dassProgress: state.dassProgress,
            teiqueProgress: state.teiqueProgress,
            totalProgress: state.totalProgress,
            currentSection: state.currentSection,
          };
          
          localStorage.setItem('psychometric-assessment', JSON.stringify(dataToSave));
          return true;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') console.error('Error saving to localStorage:', error);
          return false;
        }
      },

      loadFromLocalStorage: () => {
        try {
          const savedData = localStorage.getItem('psychometric-assessment');
          if (!savedData) return false;

          const data = JSON.parse(savedData);
          
          set({
            ...data,
            lastUpdated: new Date(),
            hexacoResponseValidity: data.hexacoResponses?.map((r: any) => r.response >= 0) || Array(60).fill(false),
            dassResponseValidity: data.dassResponses?.map((r: any) => r.response >= 0) || Array(21).fill(false),
            teiqueResponseValidity: data.teiqueResponses?.map((r: any) => r.response >= 0) || Array(30).fill(false),
            scoringCache: {
              hexacoScores: data.hexacoScores || null,
              dassScores: data.dassScores || null,
              teiqueScores: data.teiqueScores || null,
              stabilityFlags: data.stabilityFlags || null,
            },
          });
          
          return true;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') console.error('Error loading from localStorage:', error);
          return false;
        }
      },

      clearLocalStorage: () => {
        try {
          localStorage.removeItem('psychometric-assessment');
          return true;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') console.error('Error clearing localStorage:', error);
          return false;
        }
      },
    }),
    {
      name: 'psychometric-store',
    }
  )
);

// Selectors for optimized re-renders
export const useHexacoResponses = () => usePsychometricStore((state) => state.hexacoResponses);
export const useDassResponses = () => usePsychometricStore((state) => state.dassResponses);
export const useTeiqueResponses = () => usePsychometricStore((state) => state.teiqueResponses);
export const useHexacoScores = () => usePsychometricStore((state) => state.hexacoScores);
export const useDassScores = () => usePsychometricStore((state) => state.dassScores);
export const useTeiqueScores = () => usePsychometricStore((state) => state.teiqueScores);
export const useStabilityFlags = () => usePsychometricStore((state) => state.stabilityFlags);
export const useProgress = () => usePsychometricStore((state) => ({
  hexaco: state.hexacoProgress,
  dass: state.dassProgress,
  teique: state.teiqueProgress,
  total: state.totalProgress,
}));
export const useCurrentQuestion = () => usePsychometricStore((state) => ({
  scale: state.currentScale,
  question: state.currentQuestion,
  section: state.currentSection,
}));
export const useAssessmentStatus = () => usePsychometricStore((state) => ({
  isComplete: state.isComplete,
  isValid: state.isValid,
  startedAt: state.startedAt,
  completedAt: state.completedAt,
}));
