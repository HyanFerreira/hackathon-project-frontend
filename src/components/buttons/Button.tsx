import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonVariantOptions = {
  className?: string;
  variant?: ButtonVariant;
};

const buttonBaseClass =
  "inline-flex items-center justify-center gap-2 rounded-system font-normal transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus disabled:cursor-default disabled:opacity-70";

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    "h-11 gap-3 rounded-lg border border-[#7c35e8]/20 bg-gradient-to-r from-[#7c35e8] to-[#833af0] px-5 text-white shadow-sm transition hover:from-[#7330d8] hover:to-[#7934df]",
  secondary:
    "h-11 gap-3 rounded-lg border border-[#7c35e8]/20 bg-white px-5 font-normal text-[#7c35e8] shadow-sm transition hover:bg-[#7c35e8]/5",
  ghost: "",
};

export function buttonVariants({
  className,
  variant = "ghost",
}: ButtonVariantOptions = {}) {
  return twMerge(buttonBaseClass, buttonVariantClass[variant], className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = "ghost", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ className, variant })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
