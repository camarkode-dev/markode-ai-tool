// =======================
// مكتبات بدون تعريف Types
// =======================
declare module 'input-otp';
declare module 'cmdk';
declare module 'vaul';
declare module 'embla-carousel-react';
declare module '@monaco-editor/react';
declare module '@radix-ui/react-accordion';
declare module '@radix-ui/react-alert-dialog';
declare module '@radix-ui/react-aspect-ratio';
declare module '@radix-ui/react-checkbox';
declare module '@radix-ui/react-collapsible';
declare module '@radix-ui/react-context-menu';
declare module '@radix-ui/react-hover-card';
declare module '@radix-ui/react-menubar';
declare module '@radix-ui/react-navigation-menu';
declare module '@radix-ui/react-progress';
declare module '@radix-ui/react-radio-group';
declare module '@radix-ui/react-scroll-area';
declare module '@radix-ui/react-separator';
declare module '@radix-ui/react-slider';
declare module '@radix-ui/react-switch';
declare module '@radix-ui/react-toggle';
declare module 'react-day-picker';
declare module 'react-resizable-panels';
declare module 'recharts';

// =======================
// React Day Picker Icons
// =======================
type DayPickerIconProps = {
  className?: string;
  [key: string]: any;
};

// =======================
// JSX Global Elements
// =======================
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// =======================
// Embla Carousel
// =======================
type UseEmblaCarouselType = any;

// =======================
// Input OTP Types
// =======================
interface OTPInputSlot {
  char: string;
  hasFakeCaret: boolean;
  isActive: boolean;
  [key: string]: any;
}

interface OTPInputContextType {
  slots: OTPInputSlot[];
}

declare module 'input-otp' {
  import * as React from 'react';
  export const OTPInputContext: React.Context<OTPInputContextType>;
  export const OTPInput: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<'input'> & React.RefAttributes<HTMLInputElement>
  >;
}

// =======================
// Recharts
// =======================
declare namespace RechartsPrimitive {
  export type LegendProps = any;
}
