import { FC } from 'react';
import { RootKey } from './RootKey';
import '../styles/HarmonicWheel.css';

interface KeyPosition {
  angle: number;
  translateX: number;
  translateY: number;
}

// Colors from the image, matching the exact order
const KEY_COLORS = [
  '#e91e63',  // 1d/1m - Pink
  '#9c27b0',  // 2d/2m - Purple
  '#2196f3',  // 3d/3m - Blue
  '#00bcd4',  // 4d/4m - Light Blue
  '#009688',  // 5d/5m - Teal
  '#4caf50',  // 6d/6m - Green
  '#8bc34a',  // 7d/7m - Light Green
  '#cddc39',  // 8d/8m - Lime
  '#ffeb3b',  // 9d/9m - Yellow
  '#ff9800',  // 10d/10m - Orange
  '#ff5722',  // 11d/11m - Deep Orange
  '#f44336'   // 12d/12m - Red
];

const calculateKeyPosition = (index: number, isMinor: boolean): KeyPosition => {
  const angleInDegrees = index * 30;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  
  // Reduce the radius for minor keys to create inner circle
  const radiusMultiplier = isMinor ? 0.6 : 1;
  const MAX_X = 110 * radiusMultiplier;
  const MAX_Y = 220 * radiusMultiplier;
  
  return {
    angle: angleInDegrees,
    translateX: Math.round(MAX_X * Math.sin(angleInRadians)),
    translateY: Math.round((MAX_Y / 2) * (1 - Math.cos(angleInRadians)))
  };
};

export const HarmonicWheel: FC = () => {
  return (
    <div className="harmonic-wheel">
      <div className="root-key-container">
        <>
          {/* Major keys (outer circle) */}
          {Array.from({ length: 12 }, (_, index) => {
            const position = calculateKeyPosition(index, false);
            return (
              <RootKey 
                key={`${index + 1}d`}
                color={KEY_COLORS[index]}
                label={`${index + 1}d`}
                angle={position.angle}
                translateX={position.translateX}
                translateY={position.translateY}
                kind="major"
              />
            );
          })}

          {/* Minor keys (inner circle) */}
          {/* {Array.from({ length: 12 }, (_, index) => {
            const position = calculateKeyPosition(index, true);
            return (
              <RootKey 
                key={`${index + 1}m`}
                color={KEY_COLORS[index]}
                label={`${index + 1}m`}
                angle={position.angle}
                translateX={position.translateX}
                translateY={position.translateY}
                kind="minor"
              />
            );
          })} */}
        </>
      </div>
    </div>
  );
}; 
