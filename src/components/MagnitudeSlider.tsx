'use client';

interface MagnitudeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MagnitudeSlider({ value, onChange }: MagnitudeSliderProps) {
  return (
    <div className="w-1/2">
      <label htmlFor="magnitude-slider" className="block text-sm font-medium text-gray-700 mb-2">
        Minimum Magnitude: {value.toFixed(1)}
      </label>
      <input
        type="range"
        id="magnitude-slider"
        min="0"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
