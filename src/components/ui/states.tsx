import * as React from "react";
import { cn } from "@/utils/cn";
import { Inbox, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface StateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<StateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-card/20 max-w-md mx-auto my-8 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-muted-foreground mb-4">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<StateProps> = ({
  title,
  description,
  actionText = "Try Again",
  onAction,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-red-500/10 rounded-2xl bg-red-500/5 max-w-md mx-auto my-8 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-600 mb-4 dark:text-red-400">
        {icon || <AlertTriangle className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">{description}</p>
      {onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-5 border border-red-500/20 text-red-600 hover:bg-red-500/10"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const SuccessState: React.FC<StateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-emerald-500/10 rounded-2xl bg-emerald-500/5 max-w-md mx-auto my-8 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 dark:text-emerald-400">
        {icon || <CheckCircle2 className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="accent" size="sm" onClick={onAction} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};
