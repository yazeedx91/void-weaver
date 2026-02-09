import { z } from 'zod';
import type { HEXACOResponse, DASSResponse, TEIQueResponse, PsychometricResponse, ValidationResult, ValidationError } from '../types/psychometric';

// Base validation schemas
const hexacoResponseSchema = z.object({
  id: z.number().int().min(1).max(60),
  response: z.number().int().min(0).max(5), // 0-5 Likert scale
});

const dassResponseSchema = z.object({
  id: z.number().int().min(1).max(21),
  response: z.number().int().min(0).max(3), // 0-3 Likert scale
});

const teiqueResponseSchema = z.object({
  id: z.number().int().min(1).max(30),
  response: z.number().int().min(0).max(7), // 1-7 Likert scale (-1 for unanswered)
});

const psychometricResponseSchema = z.object({
  questionId: z.number().int().positive(),
  scale: z.enum(['hexaco', 'dass', 'teique']),
  value: z.number().int(),
});

// Array validation schemas
const hexacoResponsesArraySchema = z.array(hexacoResponseSchema).length(60);
const dassResponsesArraySchema = z.array(dassResponseSchema).length(21);
const teiqueResponsesArraySchema = z.array(teiqueResponseSchema).length(30);

// Complete profile validation
const psychometricProfileSchema = z.object({
  hexacoResponses: hexacoResponsesArraySchema,
  dassResponses: dassResponsesArraySchema,
  hexacoScores: z.object({
    HonestyHumility: z.number().min(0).max(5),
    Emotionality: z.number().min(0).max(5),
    Extraversion: z.number().min(0).max(5),
    Agreeableness: z.number().min(0).max(5),
    Conscientiousness: z.number().min(0).max(5),
    OpennessToExperience: z.number().min(0).max(5),
  }),
  dassScores: z.object({
    Depression: z.number().min(0).max(42),
    Anxiety: z.number().min(0).max(42),
    Stress: z.number().min(0).max(42),
  }),
  stabilityFlags: z.object({
    acuteReactiveState: z.boolean(),
    highFunctioningBurnout: z.boolean(),
    overallStability: z.enum(['Stable', 'At Risk', 'Critical']),
  }),
  completedAt: z.date().nullable(),
  lastUpdated: z.date().nullable(),
  isValid: z.boolean(),
});

// Validation functions
export class PsychometricValidator {
  static validateHexacoResponse(data: unknown): HEXACOResponse {
    const result = hexacoResponseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`HEXACO response validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateDassResponse(data: unknown): DASSResponse {
    const result = dassResponseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`DASS response validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validatePsychometricResponse(data: unknown): PsychometricResponse {
    const result = psychometricResponseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Psychometric response validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateHexacoResponses(data: unknown): HEXACOResponse[] {
    const result = hexacoResponsesArraySchema.safeParse(data);
    if (!result.success) {
      throw new Error(`HEXACO responses validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateDassResponses(data: unknown): DASSResponse[] {
    const result = dassResponsesArraySchema.safeParse(data);
    if (!result.success) {
      throw new Error(`DASS responses validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateTeiqueResponse(data: unknown): TEIQueResponse {
    const result = teiqueResponseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`TEIQue response validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateTeiqueResponses(data: unknown): TEIQueResponse[] {
    const result = teiqueResponsesArraySchema.safeParse(data);
    if (!result.success) {
      throw new Error(`TEIQue responses validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateCompleteProfile(data: unknown) {
    const result = psychometricProfileSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Psychometric profile validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  static validateResponseValue(value: number, scale: 'hexaco' | 'dass' | 'teique'): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (scale === 'hexaco') {
      if (!Number.isInteger(value) || value < 0 || value > 5) {
        errors.push({
          field: 'hexaco_response',
          message: 'HEXACO responses must be integers between 0 and 5',
          value,
        });
      }
    } else if (scale === 'dass') {
      if (!Number.isInteger(value) || value < 0 || value > 3) {
        errors.push({
          field: 'dass_response',
          message: 'DASS responses must be integers between 0 and 3',
          value,
        });
      }
    } else if (scale === 'teique') {
      if (!Number.isInteger(value) || value < 1 || value > 7) {
        errors.push({
          field: 'teique_response',
          message: 'TEIQue responses must be integers between 1 and 7',
          value,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateQuestionId(id: number, scale: 'hexaco' | 'dass' | 'teique'): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (scale === 'hexaco') {
      if (!Number.isInteger(id) || id < 1 || id > 60) {
        errors.push({
          field: 'hexaco_question_id',
          message: 'HEXACO question IDs must be integers between 1 and 60',
          value: id,
        });
      }
    } else if (scale === 'dass') {
      if (!Number.isInteger(id) || id < 1 || id > 21) {
        errors.push({
          field: 'dass_question_id',
          message: 'DASS question IDs must be integers between 1 and 21',
          value: id,
        });
      }
    } else if (scale === 'teique') {
      if (!Number.isInteger(id) || id < 1 || id > 30) {
        errors.push({
          field: 'teique_question_id',
          message: 'TEIQue question IDs must be integers between 1 and 30',
          value: id,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCompleteResponses(hexacoResponses: unknown[], dassResponses: unknown[]): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate HEXACO responses
    try {
      this.validateHexacoResponses(hexacoResponses);
    } catch (error) {
      errors.push({
        field: 'hexaco_responses',
        message: error instanceof Error ? error.message : 'Invalid HEXACO responses',
        value: hexacoResponses,
      });
    }

    // Validate DASS responses
    try {
      this.validateDassResponses(dassResponses);
    } catch (error) {
      errors.push({
        field: 'dass_responses',
        message: error instanceof Error ? error.message : 'Invalid DASS responses',
        value: dassResponses,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export schemas for external use
export {
  hexacoResponseSchema,
  dassResponseSchema,
  teiqueResponseSchema,
  psychometricResponseSchema,
  hexacoResponsesArraySchema,
  dassResponsesArraySchema,
  teiqueResponsesArraySchema,
  psychometricProfileSchema,
};
