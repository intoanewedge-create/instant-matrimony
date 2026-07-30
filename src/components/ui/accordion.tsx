import * as React from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionContextValue {
  activeItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", collapsible = true, children, className, ...props }, ref) => {
    const [activeItems, setActiveItems] = React.useState<string[]>([]);

    const toggleItem = React.useCallback(
      (value: string) => {
        setActiveItems((prev) => {
          if (type === "single") {
            return prev.includes(value) ? (collapsible ? [] : prev) : [value];
          } else {
            return prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value];
          }
        });
      },
      [type, collapsible]
    );

    return (
      <AccordionContext.Provider value={{ activeItems, toggleItem }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border-b border-border/50 pb-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ value, children, className, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionTrigger must be used inside Accordion");

    const isOpen = context.activeItems.includes(value);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.toggleItem(value)}
        className={cn(
          "flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline cursor-pointer",
          isOpen ? "text-primary font-semibold" : "text-foreground",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground", {
            "rotate-180": isOpen,
          })}
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ value, children, className, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionContent must be used inside Accordion");

    const isOpen = context.activeItems.includes(value);

    return (
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div ref={ref} className={cn("pb-4 pt-1 text-sm text-muted-foreground", className)} {...props}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
AccordionContent.displayName = "AccordionContent";
