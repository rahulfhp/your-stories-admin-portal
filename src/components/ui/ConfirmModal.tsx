"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-gray-100/90 to-gray-200/95 dark:from-gray-900/90 dark:to-black/95 backdrop-blur-xl border border-gray-300/30 dark:border-white/15 rounded-3xl text-gray-900 dark:text-white p-8 shadow-2xl shadow-gray-400/20 dark:shadow-black/40">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-base text-muted-foreground mt-4 text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex flex-row items-center justify-center gap-6 pt-4 mx-auto">
          <Button
            variant={variant}
            onClick={onConfirm}
            className="w-20 h-10 cursor-pointer"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-20 h-10 cursor-pointer"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
