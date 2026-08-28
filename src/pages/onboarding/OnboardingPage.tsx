/**
 * @doc Onboarding showcase (`/welcome`). A single self-contained screen with
 * four swipeable panels: models, workflows, price, social proof.
 *
 * Ported from the standalone starter kit, but rebuilt clean: no remote hero
 * image or background video, no extra icon/animation libraries, no runtime
 * <style> injection, and prices read from the one pricing source of truth.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ImageIcon,
  MessageSquare,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import { getPlan } from "@/data/pricingData";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/common/SEOHead";
import "@/styles/onboarding.css";

export const ONBOARDING_SEEN_KEY = "megsy_seen_welcome";

/* ------------------------------- content -------------------------------- */

interface ModelChip {
  name: string;
  provider: string;
}

const ROW_A: ModelChip[] = [
  { name: "Megsy 3.9", provider: "megsy" },
  { name: "GPT Sol", provider: "openai" },
  { name: "Claude Sonnet 5", provider: "anthropic" },
  { name: "Gemini 3 Pro", provider: "gemini" },
  { name: "Kimi K3", provider: "moonshot" },
  { name: "GLM 5.3", provider: "zhipu" },
];

const ROW_B: ModelChip[] = [
  { name: "Nano Banana Pro", provider: "nanobanana" },
  { name: "GPT Image 2", provider: "openai" },
  { name: "Seedream 4.5", provider: "bytedance" },
  { name: "FLUX.2", provider: "flux" },
  { name: "Recraft V3", provider: "recraft" },
];

const ROW_C: ModelChip[] = [
  { name: "Veo 3.1", provider: "gemini" },
  { name: "Sora 2", provider: "sora" },
  { name: "Kling 3.0", provider: "kling" },
  { name: "Hailuo 2.3", provider: "hailuo" },
  { name: "Runway Gen-4", provider: "runway" },
  { name: "Luma Ray 3", provider: "luma" },
];

const WORKFLOWS = [
  { icon: MessageSquare, title: "Chat", desc: "Every flagship model in one thread" },
  { icon: Search, title: "Deep research", desc: "Multi-step reports with sources" },
  { icon: ImageIcon, title: "Images", desc: "Unlimited generation and editing" },
  { icon: Video, title: "Video", desc: "Text, image and frame-to-video" },
  { icon: FileText, title: "Slides & docs", desc: "Full decks from one prompt" },
  { icon: Sparkles, title: "Skills", desc: "Reusable agents you build once" },
];

const CTA_LABELS = ["Start now", "Show me everything", "Sounds fair", "Create my account"];

/* ------------------------------ primitives ------------------------------- */

function ChipRow({ chips, duration, reverse }: { chips: ModelChip[]; duration: number; reverse?: boolean }) {
  const doubled = useMemo(() => [...chips, ...chips], [chips]);
  return (
    <div className="ob-marquee" aria-hidden>
      <div
        className={`ob-track${reverse ? " reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((m, i) => (
          <span key={`${m.name}-${i}`} className="ob-chip ob-glass">
            <span className="ob-chip-icon">
              {hasBrandIcon(m.name, m.provider) ? (
                <BrandIcon name={m.name} provider={m.provider} size={16} />
              ) : (
                m.name.charAt(0)
              )}
            </span>
            {m.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Heading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <header className="mb-7 text-center">
      <h1 className="ob-title text-[30px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl">
        {children}
      </h1>
      {sub && <p className="ob-sub mx-auto mt-3 max-w-[19rem] text-[14.5px] leading-relaxed">{sub}</p>}
    </header>
  );
}

/* -------------------------------- panels --------------------------------- */

function ModelsPanel() {
  return (
    <>
      <Heading sub="Chat, image and video models from every major lab — switch any time, no extra subscriptions.">
        All the AI you need, one tap away
      </Heading>
      <div className="flex flex-col gap-2.5">
        <ChipRow chips={ROW_A} duration={34} />
        <ChipRow chips={ROW_B} duration={40} reverse />
        <ChipRow chips={ROW_C} duration={30} />
      </div>
    </>
  );
}

function WorkflowsPanel() {
  return (
    <>
      <Heading sub="One workspace instead of six different tools.">One app, every AI workflow</Heading>
      <ul className="grid list-none grid-cols-2 gap-2.5 p-0">
        {WORKFLOWS.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="ob-glass rounded-2xl p-3.5">
            <Icon size={18} className="ob-ink" />
            <p className="ob-ink mt-2.5 text-[14.5px] font-semibold">{title}</p>
            <p className="ob-sub mt-1 text-[12.5px] leading-snug">{desc}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function PricingPanel() {
  const pro = getPlan("pro");
  const intro = pro?.firstMonthPrice ?? 7;
  const regular = pro?.monthlyPrice ?? 20;
  const rows = [
    { title: "Every flagship model", meta: "Chat, image and video — one subscription" },
    { title: "Unlimited images", meta: "Generate and edit without a cap" },
    { title: "Cancel any time", meta: "No contract, no hidden fees" },
  ];
  return (
    <>
      <Heading>Try everything for ${intro}</Heading>
      <div className="ob-glass rounded-3xl p-5">
        <div className="flex items-baseline gap-2">
          <span className="ob-ink text-[54px] font-semibold leading-none tracking-[-0.04em]">
            ${intro}
          </span>
          <span className="ob-sub text-sm font-medium">first month</span>
        </div>
        <p className="ob-sub mt-3 text-[13.5px] leading-relaxed">
          Then ${regular}/month. Yearly plans include 4 months free.
        </p>
        <ul className="mt-5 flex list-none flex-col gap-3 p-0">
          {rows.map((r) => (
            <li key={r.title} className="flex items-start gap-3">
              <span className="ob-check mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full">
                <Check size={12} />
              </span>
              <span className="min-w-0">
                <span className="ob-ink block text-[14.5px] font-medium">{r.title}</span>
                <span className="ob-sub block text-[12.5px]">{r.meta}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function CommunityPanel() {
  return (
    <div className="text-center">
      <Heading sub="Join them now — creating an account takes a few seconds.">
        Built for people who ship
      </Heading>
      <div className="ob-glass mx-auto flex max-w-[19rem] list-none flex-col gap-3 rounded-3xl p-5">
        {[
          { k: "60+", v: "AI models in one place" },
          { k: "6", v: "workflows: chat, research, media, docs, skills" },
          { k: "24/7", v: "background agents that keep working" },
        ].map((s) => (
          <div key={s.k} className="flex items-center gap-3 text-start">
            <span className="ob-ink w-14 shrink-0 text-2xl font-semibold tracking-[-0.03em]">
              {s.k}
            </span>
            <span className="ob-sub text-[13px] leading-snug">{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PANELS = [ModelsPanel, WorkflowsPanel, PricingPanel, CommunityPanel];

/* --------------------------------- shell --------------------------------- */

const OnboardingPage = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const touch = useRef({ x: 0, y: 0, axis: "" as "" | "x" | "y", active: false }).current;
  const last = index === PANELS.length - 1;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(PANELS.length - 1, target));
    if (clamped === index) return;
    setDir(clamped > index ? 1 : -1);
    setIndex(clamped);
  };

  const finish = async () => {
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
    const { data } = await supabase.auth.getSession();
    navigate(data.session ? "/chat" : "/auth", { replace: true });
  };

  const next = () => (last ? void finish() : goTo(index + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touch.x = e.touches[0].clientX;
    touch.y = e.touches[0].clientY;
    touch.axis = "";
    touch.active = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touch.active || touch.axis) return;
    const dx = e.touches[0].clientX - touch.x;
    const dy = e.touches[0].clientY - touch.y;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.active) return;
    touch.active = false;
    const dx = e.changedTouches[0].clientX - touch.x;
    if (touch.axis !== "x" || Math.abs(dx) < 56) return;
    if (dx < 0) next();
    else goTo(index - 1);
  };

  const Panel = PANELS[index];

  return (
    <>
      <SEOHead
        title="Welcome to Megsy AI"
        description="See what Megsy AI can do: every flagship chat, image and video model, deep research, slides and reusable skills in one workspace."
        path="/welcome"
      />
      <div
        className="ob-root"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="ob-aura"
          aria-hidden
          style={{ transform: `translate3d(${index * -4}%, ${index * -2}%, 0) scale(1.05)` }}
        />
        <div className="ob-grain" aria-hidden />

        <button
          type="button"
          onClick={() => void finish()}
          className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] ob-skip z-10 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
        >
          Skip
        </button>

        {index > 0 && (
          <button
            type="button"
            aria-label="Previous"
            onClick={() => goTo(index - 1)}
            className="ob-glass absolute start-4 top-[max(1rem,env(safe-area-inset-top))] ob-ink z-10 grid h-9 w-9 place-items-center rounded-full"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        <div className="relative h-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={index}
              className="ob-page"
              initial={reduceMotion ? false : { opacity: 0, x: dir * 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -26 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <Panel />
            </motion.section>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="flex items-center gap-1.5" aria-label="Onboarding steps">
              {PANELS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-selected={i === index}
                  aria-label={`Step ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="ob-dot border-0 bg-transparent p-1"
                >
                  <span
                    style={{
                      width: i === index ? 22 : 5,
                      background: "#fff",
                      opacity: i === index ? 1 : 0.35,
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="ob-cta ob-glass ob-ink flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-semibold"
            >
              {CTA_LABELS[index]}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingPage;
