/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }

  interface EventTarget {
    value?: string;
  }
}

declare module "@heroui/react" {
  export const Button: any;
  export const Input: any;
  export const Switch: any;
  // Add other components as needed
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: string;
  export default content;
}
