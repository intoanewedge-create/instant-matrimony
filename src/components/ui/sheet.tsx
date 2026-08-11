"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = React.useCallback(
    (val: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(val);
      }
      onOpenChange?.(val);
    },
    [isControlled, onOpenChange]
  );

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
};

export interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ children }) => {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("SheetTrigger must be used inside Sheet");

  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: (e: React.MouseEvent) => {
      const childProps = (children as React.ReactElement<any>).props;
      childProps.onClick?.(e);
      context.setOpen(true);
    },
  });
};

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom";
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "right", children, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context) throw new Error("SheetContent must be used inside Sheet");

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const sideStyles = {
      right: "right-0 top-0 bottom-0 h-full w-full max-w-sm border-l",
      left: "left-0 top-0 bottom-0 h-full w-full max-w-sm border-r",
      top: "top-0 left-0 right-0 w-full h-auto max-h-[80vh] border-b",
      bottom: "bottom-0 left-0 right-0 w-full h-auto max-h-[80vh] border-t",
    };

    const sideAnimations = {
      right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
      left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
      top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
      bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
    };

    return createPortal(
      <AnimatePresence>
        {context.open && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => context.setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Content */}
            <motion.div
              initial={sideAnimations[side].initial}
              animate={sideAnimations[side].animate}
              exit={sideAnimations[side].exit}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              ref={ref}
              className={cn(
                "fixed bg-card text-card-foreground p-6 shadow-xl flex flex-col focus:outline-none border-border/40",
                sideStyles[side],
                className
              )}
              {...props as any}
            >
              {children}
              <button
                type="button"
                onClick={() => context.setOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
SheetContent.displayName = "SheetContent";

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
  )
);
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
SheetDescription.displayName = "SheetDescription";

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col sm:flex-row sm:justify-end sm:space-x-2 mt-auto pt-6", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";
