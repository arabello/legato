import { FC } from 'react';
import '../styles/RootKey.css';

export type RootKeyKind = 'major' | 'minor';

interface RootKeyProps {
  color: string;
  label: string;
  angle: number;
  translateX: number;
  translateY: number;
  kind: RootKeyKind;
}

const MajorRootKey: FC<Omit<RootKeyProps, 'kind'>> = (props) => (
  <svg width="90" height="67" viewBox="0 0 90 67" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M89 6.94919C67.5 -0.5 22 -1 1.5 6.94919L17 66C42.5 61 48 61 73 66L89 6.94919Z"
      fill={props.color}
    />
  </svg>
);

const MinorRootKey: FC<Omit<RootKeyProps, 'kind'>> = (props) => (
  <svg width="56" height="64" viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M55 4.5C33.5 0.185463 21.5 2.38419e-07 1 4.5L17 63C26 61 32 61 40 63L55 4.5Z"
      fill={props.color}
      stroke={props.color}
    />
  </svg>
);

export const RootKey: FC<RootKeyProps> = ({ 
  color, 
  label, 
  angle,
  translateX,
  translateY,
  kind
}) => {
  return (
    <div 
      className="root-key"
      style={{ 
        '--angle': `${angle}deg`,
        '--color': color,
        '--translateX': `${translateX}px`,
        '--translateY': `${translateY}px`,
      } as React.CSSProperties}
    >
      {kind === 'major' ? (
        <MajorRootKey {...{ color, label, angle, translateX, translateY }} />
      ) : (
        <MinorRootKey {...{ color, label, angle, translateX, translateY }} />
      )}

      <span className="label">{label}</span>
    </div>
  );
}; 
