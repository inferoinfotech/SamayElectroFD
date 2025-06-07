// src/components/HelpButton.jsx
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Keyboard } from "lucide-react";

export const HelpButton = () => {
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const shortcuts = [
    { key: "alt + d", description: "Go to Dashboard", path: "/admin" },
    { key: "alt + l", description: "Go to Lead Generation", path: "/admin/lead" },
    { key: "alt + a", description: "Go to All Clients", path: "/admin/allclients" },
    { key: "alt + m", description: "Upload Meter Data", path: "/admin/meter-data" },
    { key: "alt + o", description: "Upload Logger Data", path: "/admin/logger-data" },
    { key: "alt + r", description: "Monthly Reports", path: "/admin/loss-calculation-file" },
    { key: "alt + t", description: "Monthly Reports", path: "/admin/total-generation" },
  ];

  // Register all shortcuts
  shortcuts.forEach((shortcut) => {
    useHotkeys(
      shortcut.key,
      () => navigate(shortcut.path),
      {
        preventDefault: true,
        enableOnFormTags: ['INPUT'] // Allow shortcuts even when typing in inputs
      }
    );
  });

  return (
    <TooltipProvider>
      <Tooltip open={showHelp} onOpenChange={setShowHelp}>
        <div className="fixed bottom-6 right-6 z-50">
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 p-0 shadow-lg 
                         bg-primary text-white hover:bg-primary/90 
                         dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90
                         border border-primary/20 dark:border-primary/30
                         help-button-float"
              onClick={() => setShowHelp(!showHelp)}
            >
              <Keyboard className="w-5 h-5 text-white dark:text-primary-foreground" />
            </Button>
          </TooltipTrigger>
        </div>
        <TooltipContent
          side="left"
          className="mb-2 mr-2 w-72 p-4 bg-popover border border-border shadow-xl"
          collisionPadding={16}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-black dark:text-white">Keyboard Shortcuts</h3>
            </div>
            <div className="grid gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <span className="font-medium text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <span className="font-mono bg-accent text-accent-foreground px-2 py-1 rounded text-sm">
                    {shortcut.key}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              Press these key combinations to navigate quickly
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};