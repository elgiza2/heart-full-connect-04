import { cn } from "@/lib/utils";

interface MobileSidebarButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  testId?: string;
}

/** Unified mobile sidebar toggle button used across all pages. */
export function MobileSidebarButton({
  onClick,
  className,
  ariaLabel = "Open menu",
  testId,
}: MobileSidebarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        "md:hidden w-11 h-11 rounded-2xl flex items-center justify-center text-foreground bg-transparent border-0 active:scale-95 transition",
        className,
      )}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-[22px] w-[22px]"
      >
        {/* Borderless glyph — no outer frame, just clean strokes */}
        <line
          x1="4"
          y1="6.25"
          x2="20"
          y2="6.25"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="17.75"
          x2="13.5"
          y2="17.75"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export default MobileSidebarButton;
