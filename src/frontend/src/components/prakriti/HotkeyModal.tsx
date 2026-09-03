import React from "react";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";

interface HotkeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeyModal({ isOpen, onClose }: HotkeyModalProps) {
  if (!isOpen) return null;

  const hotkeys = [
    { key: "V", desc: "Verify / Confirm AI prediction as CORRECT" },
    { key: "R", desc: "Reject / Flag AI prediction as INCORRECT" },
    { key: "Esc", desc: "Close modal / Navigate back to workspace dashboard" },
    { key: "← / →", desc: "Jump to previous / next clinical case" },
    { key: "/", desc: "Focus search bar" },
    { key: "?", desc: "Toggle this hotkey helper cheat sheet" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-card animate-fadeUp">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-base text-foreground">Practitioner Keyboard Shortcuts</h3>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          {hotkeys.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground">{item.desc}</span>
              <kbd className="px-2 py-0.5 bg-card border border-border rounded font-mono font-bold text-primary text-[11px]">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-muted border rounded font-mono text-foreground font-bold">?</kbd> anytime to open this shortcut menu.
        </div>
      </div>
    </div>
  );
}
