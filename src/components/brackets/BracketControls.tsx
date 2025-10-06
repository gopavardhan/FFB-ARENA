import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface BracketControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
}

export const BracketControls = ({ onZoomIn, onZoomOut, onFullscreen }: BracketControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onZoomIn}>
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onZoomOut}>
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onFullscreen}>
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  );
};