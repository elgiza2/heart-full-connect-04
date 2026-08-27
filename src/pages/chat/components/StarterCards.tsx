import {
  ImagePlus,
  Code2,
  Video as VideoIcon,
  Presentation,
  ScanSearch,
  FileText,
} from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";

/** Shared spring — one motion language for every chip interaction. */
const CHIP_SPRING = { type: "spring" as const, stiffness: 420, damping: 30, mass: 0.6 };

export interface StarterCardsProps {
  /** Activates the service chip for the picked card. */
  onPick: (prompt: string, mode?: string) => void;
  className?: string;
}

/** Every real service the app offers — no filler. Short labels, no descriptions. */
const CARDS = [
  {
    id: "image",
    mode: "images",
    Icon: ImagePlus,
    title: "Images",
  },
  {
    id: "web",
    mode: "code",
    Icon: Code2,
    title: "Website",
  },
  {
    id: "video",
    mode: "video",
    Icon: VideoIcon,
    title: "Video",
  },
  {
    id: "slides",
    mode: "slides",
    Icon: Presentation,
    title: "Slides",
  },
  {
    id: "research",
    mode: "deep-research",
    Icon: ScanSearch,
    title: "Research",
  },
  {
    id: "docs",
    mode: "docs",
    Icon: FileText,
    title: "Documents",
  },
];

const handleCardClick = (
  c: (typeof CARDS)[number],
  onPick: StarterCardsProps["onPick"],
) => {
  if (c.id === "integrations") {
    window.dispatchEvent(new CustomEvent("megsy:open-integrations"));
    return;
  }
  onPick("", (c as { mode?: string }).mode);
};

/** Desktop-only: compact icon chips shown below the composer (no images). */
export function StarterChips({ onPick, className = "" }: StarterCardsProps) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="starter-chips-desktop"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={CHIP_SPRING}
        className={`hidden md:flex flex-wrap items-center justify-center gap-2 ${className}`}
      >
        {CARDS.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            layout
            onClick={() => handleCardClick(c, onPick)}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ ...CHIP_SPRING, delay: i * 0.025 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2 rounded-lg border border-border/40 bg-background hover:bg-accent/60 px-3.5 h-9 shadow-sm"
          >
            <c.Icon className="w-[15px] h-[15px] text-foreground/70 shrink-0" strokeWidth={1.9} />
            <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
              {c.title}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export function StarterCards({ onPick, className = "" }: StarterCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={CHIP_SPRING}
      className={`w-full md:hidden ${className}`}
    >
      <div className="flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x">
        {CARDS.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            layout
            onClick={() => handleCardClick(c, onPick)}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ ...CHIP_SPRING, delay: i * 0.03 }}
            whileTap={{ scale: 0.92 }}
            className="snap-start shrink-0 inline-flex items-center gap-2 rounded-lg border border-border/40 bg-background hover:bg-accent/60 px-3.5 h-10 shadow-sm"
          >
            <c.Icon className="w-4 h-4 text-foreground/70 shrink-0" strokeWidth={1.9} />
            <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
              {c.title}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default StarterCards;
