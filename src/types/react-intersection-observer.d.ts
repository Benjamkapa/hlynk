declare module 'react-intersection-observer' {
  import * as React from 'react';
  export function useInView(options?: any): [React.RefObject<HTMLElement>, boolean];
  export const InView: React.ComponentType<any>;
}
