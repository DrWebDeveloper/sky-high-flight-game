
import React from 'react';

interface CountdownDisplayProps {
  countdown: number;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ countdown }) => {
  return (
    <div className="flex justify-center mt-2">
      <div className="glass-panel px-4 py-1 rounded-full">
        <p className="text-sm">
          Next round in: <span className="font-bold">{countdown}s</span>
        </p>
      </div>
    </div>
  );
};

export default CountdownDisplay;
