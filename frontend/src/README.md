# FLUX - Psychometric Neural Engine

A comprehensive TypeScript-based psychometric assessment system built with React, Zustand, Zod, and Framer Motion. This system implements the HEXACO-60 personality inventory, DASS-21 mental health screening, and TEIQue-SF emotional intelligence tools with advanced scoring algorithms and dynamic range analysis.

## Architecture Overview

The Psychometric Neural Engine is structured into four main layers:

### 1. Type System (`src/types/psychometric.ts`)
- **120+ state variables** managed through comprehensive TypeScript interfaces
- HEXACO-60 response types with 6 facet mappings
- DASS-21 response types with 3 scale mappings
- Stability index flags and cross-correlation types
- Complete psychometric profile interfaces

### 2. Validation Layer (`src/validation/psychometricSchemas.ts`)
- **Zod schemas** for all psychometric data models
- Real-time response validation (0-5 for HEXACO, 0-3 for DASS)
- Array validation ensuring complete datasets
- Comprehensive error handling and reporting

### 3. Scoring Algorithm (`src/algorithms/ScoringAlgorithm.ts`)
- **HEXACO-60 scoring** with reverse-coding logic for specific items
- **DASS-21 scoring** with proper scaling (sum × 2)
- **Stability Index** cross-correlation analysis:
  - Acute Reactive State: DASS_Stress > 24 AND HEXACO_Emotionality > 4.2
  - High-Functioning Burnout: HEXACO_Conscientiousness > 4.5 AND DASS_Depression > 15
- Response completeness validation

### 4. State Management (`src/store/PsychometricProvider.ts`)
- **Zustand-based** state management with 120+ variables
- Real-time progress tracking for both scales
- Response validity arrays for each question
- Local storage persistence
- Batch operations and import/export functionality
- Optimized selectors for performance

## Key Features

### HEXACO-60 Implementation
- 60 items mapped to 6 personality facets
- Reverse-coding for 30+ items
- 5-point Likert scale (0-5)
- Facet scoring: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness to Experience

### DASS-21 Implementation
- 21 items mapped to 3 mental health scales
- 4-point Likert scale (0-3)
- Scaled scoring (sum × 2) to align with DASS-42
- Depression, Anxiety, and Stress subscales

### Stability Index Analysis
- Cross-correlation between personality and mental health metrics
- Risk factor identification
- Overall stability classification (Stable, At Risk, Critical)
- Clinical flagging for specific patterns

### Advanced Features
- **Response time tracking** for each question
- **Progress visualization** with percentage completion
- **Data persistence** via localStorage
- **Import/Export** functionality for assessment profiles
- **Real-time validation** with immediate feedback
- **Batch operations** for efficient data management

## Usage Examples

### Basic Assessment Flow

```typescript
import { usePsychometricStore } from './store/PsychometricProvider';

function AssessmentComponent() {
  const { 
    setHexacoResponse, 
    setDassResponse, 
    calculateScores,
    hexacoScores,
    dassScores,
    stabilityFlags 
  } = usePsychometricStore();

  // Set responses
  const handleHexacoAnswer = (questionId: number, response: number) => {
    setHexacoResponse(questionId, response);
  };

  const handleDassAnswer = (questionId: number, response: number) => {
    setDassResponse(questionId, response);
  };

  // Calculate scores when complete
  const completeAssessment = () => {
    calculateScores();
  };

  return (
    // Your assessment UI
  );
}
```

### Advanced Usage with Selectors

```typescript
import { 
  useHexacoScores, 
  useDassScores, 
  useStabilityFlags,
  useProgress 
} from './store/PsychometricProvider';

function ResultsDisplay() {
  const hexacoScores = useHexacoScores();
  const dassScores = useDassScores();
  const stabilityFlags = useStabilityFlags();
  const progress = useProgress();

  return (
    <div>
      <h2>HEXACO Scores</h2>
      {hexacoScores && Object.entries(hexacoScores).map(([facet, score]) => (
        <p key={facet}>{facet}: {score.toFixed(2)}</p>
      ))}
      
      <h2>DASS Scores</h2>
      {dassScores && Object.entries(dassScores).map(([scale, score]) => (
        <p key={scale}>{scale}: {score}</p>
      ))}
      
      <h2>Stability Analysis</h2>
      {stabilityFlags && (
        <div>
          <p>Overall Stability: {stabilityFlags.overallStability}</p>
          <p>Acute Reactive State: {stabilityFlags.acuteReactiveState ? 'Yes' : 'No'}</p>
          <p>High-Functioning Burnout: {stabilityFlags.highFunctioningBurnout ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
```

### Data Export/Import

```typescript
import { usePsychometricStore } from './store/PsychometricProvider';

function DataManager() {
  const { exportProfile, importProfile } = usePsychometricStore();

  const exportData = () => {
    const profile = exportProfile();
    if (profile) {
      const json = JSON.stringify(profile, null, 2);
      // Save to file or send to server
    }
  };

  const importData = (jsonData: string) => {
    try {
      const profile = JSON.parse(jsonData);
      const success = importProfile(profile);
      console.log('Import successful:', success);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    // Export/Import UI
  );
}
```

## Validation System

The system uses Zod for comprehensive validation:

```typescript
import { PsychometricValidator } from './validation/psychometricSchemas';

// Validate individual responses
const hexacoResponse = PsychometricValidator.validateHexacoResponse({
  id: 1,
  response: 4
});

const dassResponse = PsychometricValidator.validateDassResponse({
  id: 1,
  response: 2
});

// Validate complete arrays
const hexacoArray = PsychometricValidator.validateHexacoResponses(responses);
const dassArray = PsychometricValidator.validateDassResponses(responses);
```

## Scoring Algorithm Usage

```typescript
import { ScoringAlgorithm } from './algorithms/ScoringAlgorithm';

// Calculate individual scores
const hexacoScores = ScoringAlgorithm.calculateHEXACOScores(hexacoResponses);
const dassScores = ScoringAlgorithm.calculateDASSScores(dassResponses);

// Calculate stability index
const stabilityFlags = ScoringAlgorithm.calculateStabilityIndex(
  hexacoScores, 
  dassScores
);

// Complete scoring
const results = ScoringAlgorithm.calculateScores({
  hexacoResponses,
  dassResponses
});
```

## Performance Optimizations

- **Optimized selectors** prevent unnecessary re-renders
- **Response caching** reduces redundant calculations
- **Batch operations** for efficient state updates
- **Lazy loading** of assessment items
- **Debounced validation** for real-time feedback

## Dependencies

- **zustand**: State management
- **zod**: Schema validation
- **react**: UI framework
- **typescript**: Type safety

## Installation

```bash
npm install zustand zod
# or
yarn add zustand zod
```

## File Structure

```
src/
├── types/
│   └── psychometric.ts          # All type definitions
├── validation/
│   └── psychometricSchemas.ts   # Zod validation schemas
├── algorithms/
│   └── ScoringAlgorithm.ts      # Scoring logic and calculations
├── store/
│   └── PsychometricProvider.ts  # Zustand state management
├── index.ts                     # Main export file
└── README.md                    # This documentation
```

## Clinical Considerations

This system is designed for research and screening purposes only. The Stability Index and clinical flags should be interpreted by qualified mental health professionals. The scoring algorithms follow established psychometric standards but should not replace clinical assessment.

## Contributing

When extending the system:

1. Maintain type safety with comprehensive interfaces
2. Add appropriate Zod validation for new data models
3. Update the scoring algorithm for new assessment tools
4. Extend the state management with proper selectors
5. Update this documentation with new features

## License

This project is part of the FLUX Dynamic Range Assessment platform.
