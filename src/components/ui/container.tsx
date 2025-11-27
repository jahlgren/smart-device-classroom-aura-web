import { cn } from "@/lib/utils";
import React, { forwardRef, JSX } from "react";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  maxWidth?: MaxWidth;
}

const maxWidthMap: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      as = "div",
      children,
      maxWidth,
      className,
      ...rest
    },
    ref
  ) => {

    const mwClass = maxWidth ? maxWidthMap[maxWidth] : "max-w-3xl";

    const base = cn(
      "w-full",
      "mx-auto",
      className,
      mwClass
    );

    const Component = as as any;

    return (
      <Component ref={ref} className={base} {...rest}>
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

export default Container;