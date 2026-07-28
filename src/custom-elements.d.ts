// src/custom-elements.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    // We use 'any' here to completely bypass TypeScript's strict attribute checking 
    // for this specific custom web component, instantly killing the red line.
    'model-viewer': any;
  }
}