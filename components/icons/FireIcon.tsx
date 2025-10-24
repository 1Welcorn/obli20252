// [FE-FIX] Implemented the missing FireIcon component.
import React from 'react';

export const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A24.75 24.75 0 0112 12.75c0 2.516.51 4.925 1.455 7.086A.75.75 0 0014.25 21h.001a.75.75 0 00.744-.643 23.25 23.25 0 00-1.44-15.025.75.75 0 00-.591-.446z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10.232 3.338a.75.75 0 00-1.06 1.06A23.252 23.252 0 0110.5 12.75c0 2.274.451 4.445 1.258 6.436a.75.75 0 001.401-.52 21.748 21.748 0 00-1.196-14.72.75.75 0 00-.73-.608z" clipRule="evenodd" />
  </svg>
);
