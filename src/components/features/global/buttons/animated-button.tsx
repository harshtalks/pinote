"use client";

import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

// idle -> pending -> success | error
export type ButtonState = "idle" | "pending" | "success" | "error";
export type AnimatedButtonProps = Omit<ButtonProps, "children" | "variant"> & {
  buttonState: ButtonState;
  labels?: {
    idle?: ReactNode;
    pending?: ReactNode;
    success?: ReactNode;
    error?: ReactNode;
  };
  variants?: {
    idle?: ButtonProps["variant"];
    pending?: ButtonProps["variant"];
    success?: ButtonProps["variant"];
    error?: ButtonProps["variant"];
  };
};

export const AnimatedButton = ({
  buttonState,
  labels,
  className,
  size,
  ...props
}: AnimatedButtonProps) => {
  const btnLabels = {
    idle: labels?.idle ?? "Create new account",
    pending: labels?.pending ?? <Loader size={16} className="animate-spin" />,
    success: labels?.success ?? "Success",
    error: labels?.error ?? "Error",
  };

  const currentLabel = btnLabels[buttonState];

  const thisButtonvariants = {
    idle: buttonVariants({ variant: "default", size }),
    pending: buttonVariants({ variant: "default", size }),
    success: buttonVariants({ variant: "success", size }),
    error: buttonVariants({ variant: "destructive", size }),
  };

  return (
    <motion.div
      layout
      transition={{
        default: { ease: "easeInOut" },
        layout: { duration: 0.25 },
      }}
      className="w-auto h-fit"
    >
      <button
        data-state={buttonState}
        className={cn(
          thisButtonvariants[buttonState],
          "disabled:opacity-80 disabled:pointer-events-none",
          "data-[state=idle]:pointer-events-auto pointer-events-none",
          "min-w-[200px] min-h-10 w-full relative overflow-hidden",
          className,
        )}
        {...props}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            transition={{
              default: { ease: "easeInOut" },
              duration: 0.25,
            }}
            className={cn("absolute inset-0 flex items-center justify-center")}
            initial={{
              y: "100%",
            }}
            animate={{
              y: "0%",
            }}
            exit={{
              y: "-100%",
            }}
            key={buttonState}
          >
            {currentLabel}
          </motion.span>
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

export const useAnimatedButton = (props?: {
  initial?: ButtonState;
  resetDuration?: number;
  disabledAutoReset?: boolean;
}) => {
  const [state, setState] = useState<ButtonState>(props?.initial ?? "idle");
  const resetDuration = props?.resetDuration ?? 2000;

  const changeButtonState = (state: ButtonState) => {
    setState(state);
  };

  // when the state is pending or success, we want to reset it to idle after a while
  useEffect(() => {
    if (!props?.disabledAutoReset) {
      if (state === "pending" || state === "error") {
        const timeout = setTimeout(() => {
          setState("idle");
        }, resetDuration);

        return () => {
          clearTimeout(timeout);
        };
      }
    }
  }, [state, resetDuration, props?.disabledAutoReset]);

  return {
    buttonState: state,
    changeButtonState,
  };
};
