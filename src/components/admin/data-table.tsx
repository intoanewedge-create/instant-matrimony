"use client";

import React from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  bulkActions?: {
    label: string;
    onClick: (ids: string[]) => void;
    variant?: "default" | "destructive" | "outline" | "success";
  }[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    column: string;
    order: "asc" | "desc";
    onSort: (column: string, order: "asc" | "desc") => void;
  };
  search?: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  };
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  selectedIds = [],
  onSelectedIdsChange,
  bulkActions = [],
  pagination,
  sorting,
  search,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectedIdsChange) return;
    if (e.target.checked) {
      onSelectedIdsChange(data.map((row) => row.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectedIdsChange) return;
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter((x) => x !== id));
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  const handleSort = (columnKey: string) => {
    if (!sorting) return;
    const isCurrent = sorting.column === columnKey;
    const order = isCurrent && sorting.order === "asc" ? "desc" : "asc";
    sorting.onSort(columnKey, order);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      {(search || bulkActions.length > 0) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card shadow-sm">
          {search && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={search.placeholder || "Search..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="pl-9 h-10"
                aria-label="Global table search"
              />
            </div>
          )}

          {/* Bulk actions banner */}
          {selectedIds.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-3 w-full sm:w-auto bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg animate-fade-in">
              <span className="text-xs font-bold text-primary whitespace-nowrap">
                {selectedIds.length} selected
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {bulkActions.map((act, idx) => (
                  <Button
                    key={idx}
                    variant={act.variant === "destructive" ? "accent" : act.variant === "success" ? "default" : "outline"}
                    size="sm"
                    onClick={() => act.onClick(selectedIds)}
                    className="h-8 text-xs font-semibold px-2.5"
                  >
                    {act.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 shadow-sm bg-card">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-sm border-collapse text-left" role="table">
            <thead className="bg-muted/40 border-b border-border/40 sticky top-0 z-10">
              <tr role="row">
                {onSelectedIdsChange && (
                  <th className="p-4 w-12 text-center" role="columnheader">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      aria-label="Select all rows on this page"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sorting?.column === col.key;
                  const sortDir = isSorted ? sorting?.order : null;

                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`p-4 font-semibold text-foreground select-none ${
                        col.sortable ? "cursor-pointer hover:bg-muted/60 transition-colors" : ""
                      }`}
                      role="columnheader"
                      aria-sort={isSorted ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-muted-foreground/60">
                            {sortDir === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-primary" />
                            ) : sortDir === "desc" ? (
                              <ChevronDown className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronDown className="h-4 w-4 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20" role="rowgroup">
              {loading ? (
                Array.from({ length: 4 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {onSelectedIdsChange && (
                      <td className="p-4 text-center">
                        <div className="h-4 w-4 bg-muted rounded mx-auto" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onSelectedIdsChange ? 1 : 0)} className="p-12 text-center text-muted-foreground font-medium">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const isChecked = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-muted/10 transition-colors ${isChecked ? "bg-primary/5" : ""}`}
                      role="row"
                    >
                      {onSelectedIdsChange && (
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            aria-label={`Select row ${row.id}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="p-4 select-text font-medium text-muted-foreground">
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="bg-card border border-border/40 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Select row count per page"
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              Showing {Math.min(pagination.total, (pagination.page - 1) * pagination.pageSize + 1)}–
              {Math.min(pagination.total, pagination.page * pagination.pageSize)} of {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1 || loading}
              onClick={() => pagination.onPageChange(1)}
              className="h-8 w-8"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1 || loading}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="h-8 w-8"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 bg-muted/30 border border-border/30 rounded-lg text-foreground font-bold">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= totalPages || loading}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="h-8 w-8"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= totalPages || loading}
              onClick={() => pagination.onPageChange(totalPages)}
              className="h-8 w-8"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
