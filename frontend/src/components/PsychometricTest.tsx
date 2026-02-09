import React from 'react';
import { usePsychometricStore } from '../store/PsychometricProvider';

export const PsychometricTest: React.FC = () => {
  const {
    hexacoResponses,
    dassResponses,
    hexacoScores,
    dassScores,
    stabilityFlags,
    hexacoProgress,
    dassProgress,
    totalProgress,
    isComplete,
    isValid,
    setHexacoResponse,
    setDassResponse,
    calculateScores,
    resetAssessment,
  } = usePsychometricStore();

  const handleHexacoTest = () => {
    // Set some test responses
    setHexacoResponse(1, 4); // Honest
    setHexacoResponse(2, 1); // Not entitled
    setHexacoResponse(11, 2); // Some fear
    setHexacoResponse(21, 5); // Very extraverted
    setHexacoResponse(31, 4); // Interested in people
    setHexacoResponse(41, 5); // Very conscientious
    setHexacoResponse(51, 4); // Interested in new ideas
  };

  const handleDassTest = () => {
    // Set some test responses
    setDassResponse(1, 1); // Sometimes hard to wind down
    setDassResponse(11, 0); // Never close to panic
    setDassResponse(21, 2); // Often difficult to breathe
  };

  const handleCalculateScores = () => {
    calculateScores();
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Psychometric Neural Engine Test</h2>
      
      {/* Test Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleHexacoTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set Test HEXACO Responses
          </button>
          <button
            onClick={handleDassTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Set Test DASS Responses
          </button>
          <button
            onClick={handleCalculateScores}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Calculate Scores
          </button>
          <button
            onClick={resetAssessment}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Assessment
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Progress</h3>
        <div className="space-y-2">
          <div>
            <span>HEXACO: {hexacoProgress.toFixed(1)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${hexacoProgress}%` }}
              />
            </div>
          </div>
          <div>
            <span>DASS: {dassProgress.toFixed(1)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${dassProgress}%` }}
              />
            </div>
          </div>
          <div>
            <span>Total: {totalProgress.toFixed(1)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 space-x-4">
          <span className={`px-2 py-1 rounded text-sm ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isComplete ? 'Complete' : 'In Progress'}
          </span>
          <span className={`px-2 py-1 rounded text-sm ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>

      {/* HEXACO Responses */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">HEXACO Responses (Sample)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {hexacoResponses.slice(0, 8).map((response) => (
            <div key={response.id} className="text-sm p-2 bg-gray-50 rounded">
              Q{response.id}: {response.response >= 0 ? response.response : '-'}
            </div>
          ))}
        </div>
      </div>

      {/* DASS Responses */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">DASS Responses (Sample)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dassResponses.slice(0, 8).map((response) => (
            <div key={response.id} className="text-sm p-2 bg-gray-50 rounded">
              Q{response.id}: {response.response >= 0 ? response.response : '-'}
            </div>
          ))}
        </div>
      </div>

      {/* Scores */}
      {hexacoScores && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">HEXACO Scores</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(hexacoScores).map(([facet, score]) => (
              <div key={facet} className="text-sm p-2 bg-blue-50 rounded">
                {facet}: {score.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}

      {dassScores && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">DASS Scores</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(dassScores).map(([scale, score]) => (
              <div key={scale} className="text-sm p-2 bg-green-50 rounded">
                {scale}: {score}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stability Flags */}
      {stabilityFlags && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Stability Analysis</h3>
          <div className="space-y-2">
            <div className={`text-sm p-2 rounded ${stabilityFlags.acuteReactiveState ? 'bg-red-100 text-red-800' : 'bg-gray-50'}`}>
              Acute Reactive State: {stabilityFlags.acuteReactiveState ? '⚠️ YES' : '✅ No'}
            </div>
            <div className={`text-sm p-2 rounded ${stabilityFlags.highFunctioningBurnout ? 'bg-orange-100 text-orange-800' : 'bg-gray-50'}`}>
              High-Functioning Burnout: {stabilityFlags.highFunctioningBurnout ? '⚠️ YES' : '✅ No'}
            </div>
            <div className={`text-sm p-2 rounded font-semibold ${
              stabilityFlags.overallStability === 'Stable' ? 'bg-green-100 text-green-800' :
              stabilityFlags.overallStability === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Overall Stability: {stabilityFlags.overallStability}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>This component tests the Psychometric Neural Engine functionality.</p>
        <p>Click the test buttons to populate sample data and calculate scores.</p>
      </div>
    </div>
  );
};

export default PsychometricTest;
