import React from 'react';
import { create } from 'zustand';

// Simple test store to verify Zustand is working
type TestStore = {
  count: number;
  inc: () => void;
  dec: () => void;
  reset: () => void;
};

const useTestStore = create<TestStore>()((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 1 }),
}));

export const TestCounter: React.FC = () => {
  const { count, inc, dec, reset } = useTestStore();

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Zustand Test Counter</h3>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold">{count}</span>
        <button 
          onClick={dec}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -1
        </button>
        <button 
          onClick={inc}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          +1
        </button>
        <button 
          onClick={reset}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Testing if Zustand is properly installed and working
      </p>
    </div>
  );
};

export default TestCounter;
