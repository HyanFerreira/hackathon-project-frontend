import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ComponentPropsWithoutRef<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          "inline-flex items-center justify-center gap-2 rounded-system font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus disabled:cursor-default disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
