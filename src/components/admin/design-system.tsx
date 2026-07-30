"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, ChevronRight, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Skip Navigation Link for A11y
export function SkipNavLink() {
  return (
    <a
      href="#admin-main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
  );
}

// AdminPageHeader
interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6 mb-6">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded px-1">
                    {crumb.label}
                  </a>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground select-text">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl select-text">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap md:self-end">
          {actions}
        </div>
      )}
    </div>
  );
}

// AdminCard
interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminCard({ children, className = "", title, subtitle, actions, footer }: AdminCardProps) {
  return (
    <div
      className={`bg-card text-card-foreground rounded-xl border border-border/40 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border/80 focus-within:ring-2 focus-within:ring-primary/20 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-border/10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-muted/20 border-t border-border/10 text-xs text-muted-foreground flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}

// AdminSection
interface AdminSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminSection({ title, description, children, className = "" }: AdminSectionProps) {
  return (
    <section className={`grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-border/10 pb-8 mb-8 last:border-b-0 last:pb-0 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground max-w-sm">{description}</p>}
      </div>
      <div className="lg:col-span-2 space-y-6">
        {children}
      </div>
    </section>
  );
}

// AdminStatGrid
export function AdminStatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {children}
    </div>
  );
}

// AdminToolbar
export function AdminToolbar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card p-4 rounded-xl border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm mb-6 ${className}`}>
      {children}
    </div>
  );
}

// AdminEmptyState
interface AdminEmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function AdminEmptyState({ title, description, action, icon }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/60 rounded-xl bg-card min-h-[300px]">
      <div className="p-4 bg-muted/40 rounded-full text-muted-foreground/60 mb-4">
        {icon || <Inbox className="h-10 w-10" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// AdminErrorState
interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function AdminErrorState({ title = "An error occurred", message, onRetry }: AdminErrorStateProps) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 my-6 max-w-4xl mx-auto shadow-sm animate-fade-in" role="alert">
      <AlertTriangle className="h-6 w-6 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <h4 className="font-bold text-sm leading-none">{title}</h4>
        <p className="text-xs text-rose-500/80 font-medium select-text">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 h-9"
        >
          <RotateCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

// AdminLoadingOverlay
export function AdminLoadingOverlay({ show, message = "Processing operation..." }: { show: boolean; message?: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && overlayRef.current) {
      // Manage focus for accessibility
      const focusable = overlayRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      } else {
        overlayRef.current.focus();
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Loading content"
    >
      <div className="flex flex-col items-center space-y-4 p-6 bg-card border border-border/80 shadow-2xl rounded-2xl max-w-xs text-center animate-scale-up">
        <RotateCw className="h-10 w-10 text-primary animate-spin" />
        <div>
          <h4 className="font-bold text-sm text-foreground">Please wait</h4>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
