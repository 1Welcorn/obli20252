// [FE-FIX] This file was created to provide a trophy icon for the challenge modal.
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.056-4.329l3.22-5.452.923-.023c.334 0 .66.024.98.071l3.22 5.452A9.75 9.75 0 0116.5 18.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v6m-9-3.375h2.25m13.5 0H21M3 18.75h2.25m13.5 0H21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c-2.43 0-4.5 1.5-5.25 3.75h10.5c-.75-2.25-2.82-3.75-5.25-3.75z" />
  </svg>
);
