export {};

declare global {
  interface Window {
    herd: {
      trackConversion: (elementId?: string) => void;
    };
  }
}
