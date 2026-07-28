// src/types/model-viewer.d.ts
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'camera-controls'?: boolean | string;
        'touch-action'?: string;
        'shadow-intensity'?: string | number;
        'auto-rotate'?: boolean | string;
        exposure?: string | number;
        'environment-image'?: string;
        poster?: string;
        class?: string;
      };
    }
  }
}