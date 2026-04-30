"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

/**
 * ModalShell — single entry point for the M3.6 production modals.
 *
 * Picks Dialog (centered, desktop) or Drawer (vaul bottom-sheet, mobile)
 * based on the `md` breakpoint. Each consumer modal stays focused on its
 * own state machine; this component owns the responsive shell.
 *
 * Per omega-docs/03-brand/visual-identity.md the soft-surface treatment is
 * already baked into the underlying Dialog/Drawer primitives — no extra
 * border or hard hairline here.
 */
export interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Optional max-width override for the desktop Dialog. Defaults to `lg`. */
  desktopMaxWidth?: string;
  className?: string;
}

export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  desktopMaxWidth = "max-w-md",
  className,
}: ModalShellProps) {
  const isDesktop = useIsDesktop();
  const shellClassName = cn("glass bg-background/0", className);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(desktopMaxWidth, shellClassName)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
          {footer}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={shellClassName}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="px-4 pb-2">{children}</div>
        {footer ? <div className="p-4">{footer}</div> : null}
      </DrawerContent>
    </Drawer>
  );
}
