# Psychometric Neural Engine - Complete Export

## 📦 What's Included

This export contains the complete Psychometric Neural Engine system:

### 🏗️ Architecture Files
- **src/types/** - All TypeScript interfaces (120+ state variables)
- **src/validation/** - Zod validation schemas
- **src/algorithms/** - HEXACO-60 & DASS-21 scoring algorithms
- **src/store/** - Zustand state management
- **src/components/** - Test components
- **src/index.ts** - Main export file
- **package.json** - Dependencies (includes Zustand)

## 🚀 How to Use in Replit

### Option 1: Direct File Upload
1. Create a new Replit project
2. Upload all files from this export
3. Run `npm install` in Replit shell
4. Start development server

### Option 2: Git Repository
1. Create a new GitHub repository
2. Upload these files to GitHub
3. Clone repository in Replit
4. Run `npm install`

## 📋 File Structure for Replit

```
your-replit-project/
├── src/
│   ├── types/
│   │   └── psychometric.ts          # All interfaces
│   ├── validation/
│   │   └── psychometricSchemas.ts   # Zod validation
│   ├── algorithms/
│   │   └── ScoringAlgorithm.ts      # Scoring logic
│   ├── store/
│   │   └── PsychometricProvider.ts  # Zustand store
│   ├── components/
│   │   ├── TestCounter.tsx          # Basic Zustand test
│   │   └── PsychometricTest.tsx     # Full engine test
│   ├── index.ts                    # Main exports
│   └── README.md                   # Documentation
├── package.json                    # Dependencies
└── README.md                      # This file
```

## ⚙️ Setup Commands

In Replit shell:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🧪 Testing the Engine

### Basic Test
```tsx
import { TestCounter } from './src/components/TestCounter';

function App() {
  return <TestCounter />;
}
```

### Full Psychometric Test
```tsx
import { PsychometricTest } from './src/components/PsychometricTest';

function App() {
  return <PsychometricTest />;
}
```

## 🎯 Key Features

- **120+ State Variables**: Complete psychometric data management
- **HEXACO-60**: 60 items, 6 facets, reverse-coding
- **DASS-21**: 21 items, 3 scales, proper scaling
- **Stability Index**: Cross-correlation analysis
- **Real-time Validation**: Zod schemas for all data
- **Zustand State**: Optimized performance with selectors
- **TypeScript**: Full type safety throughout

## 📊 Quick Start Example

```tsx
import React from 'react';
import { usePsychometricStore } from './src/store/PsychometricProvider';

function MyComponent() {
  const { 
    hexacoScores, 
    dassScores, 
    stabilityFlags,
    setHexacoResponse,
    calculateScores 
  } = usePsychometricStore();

  const handleAnswer = (questionId: number, response: number) => {
    setHexacoResponse(questionId, response);
  };

  const completeAssessment = () => {
    calculateScores();
  };

  return (
    <div>
      {hexacoScores && (
        <div>
          <h3>HEXACO Scores</h3>
          <p>Honesty-Humility: {hexacoScores.HonestyHumility}</p>
          <p>Emotionality: {hexacoScores.Emotionality}</p>
          {/* ... other facets */}
        </div>
      )}
      
      {stabilityFlags && (
        <div>
          <h3>Stability Analysis</h3>
          <p>Overall: {stabilityFlags.overallStability}</p>
          <p>Acute Reactive: {stabilityFlags.acuteReactiveState ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
```

## 🔧 Dependencies Required

```json
{
  "dependencies": {
    "zustand": "^5.0.0",
    "zod": "^3.25.76",
    "react": "^18.3.1",
    "typescript": "^5.8.3"
  }
}
```

## 📱 Replit-Specific Notes

1. **Port**: Replit automatically assigns ports
2. **Environment**: All dependencies work in Replit environment
3. **Hot Reload**: Development server supports hot reloading
4. **TypeScript**: Full TypeScript support in Replit

## 🎉 Ready to Use

This export contains everything you need to run the Psychometric Neural Engine in Replit:

- ✅ All source code files
- ✅ Dependencies configured
- ✅ Test components included
- ✅ Complete documentation
- ✅ TypeScript interfaces
- ✅ Validation schemas
- ✅ Scoring algorithms
- ✅ State management

Just upload to Replit, run `npm install`, and start building!
