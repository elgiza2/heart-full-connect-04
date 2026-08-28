/**
 * @doc Public product documentation hub. `/docs` previously redirected to Chat
 * (soft 404). Content is factual and describes only features that exist in the
 * product today — chat, research, media, skills, integrations, plans.
 */
import { Link, useLocation } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

interface DocSection {
  id: string;
  heading: string;
  body: string[];
  links?: { label: string; to: string }[];
}

const SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    heading: "Getting started",
    body: [
      "Create an account, then open the chat workspace. Everything — conversations, research runs, generated media and skills — is tied to your account and only visible to you.",
      "The composer accepts text, files and images. Use the + button to attach files, switch web search between on, off and automatic, and pick a model.",
    ],
    links: [
      { label: "Open Megsy", to: "/chat" },
      { label: "Account settings", to: "/settings" },
    ],
  },
  {
    id: "models",
    heading: "Models and web search",
    body: [
      "Model availability depends on your plan. The model picker shows which models your plan can use and what each one is best at.",
      "Web search has three modes. Automatic lets Megsy decide when a question needs fresh sources; on forces a search; off keeps the answer to the model's own knowledge.",
    ],
  },
  {
    id: "research",
    heading: "Deep research",
    body: [
      "Deep research runs a multi-step investigation: it plans sub-questions, reads sources, and produces a report with citations you can open.",
      "Research runs take longer than a normal reply and keep running in the background — you can leave the tab and come back to the finished report.",
    ],
  },
  {
    id: "media",
    heading: "Images and video",
    body: [
      "Image generation is unlimited on paid plans. You can attach reference images to keep a character or style consistent across scenes.",
      "Video generation is metered: each plan includes a monthly number of premium video generations, enforced on the server. Models served through DeAPI are unlimited and do not count against that allowance.",
    ],
    links: [{ label: "Plan limits", to: "/pricing" }],
  },
  {
    id: "skills",
    heading: "Skills",
    body: [
      "A skill is a reusable instruction set you can turn on for a conversation. Build one from scratch, import one, or enable a skill from the library.",
      "Only enabled skills affect a conversation, and skills belong to your account.",
    ],
    links: [{ label: "Skills library", to: "/skills" }],
  },
  {
    id: "integrations",
    heading: "Integrations and MCP",
    body: [
      "Integrations connect external tools to your workspace. Connections are stored per account and can be disconnected at any time from settings.",
      "MCP servers can be added to expose additional tools to the assistant. Sensitive tool calls ask for your approval before they run.",
    ],
    links: [{ label: "Integrations settings", to: "/settings/mcp" }],
  },
  {
    id: "billing",
    heading: "Plans, credits and billing",
    body: [
      "Plans are billed monthly or yearly; the yearly option is priced at eight months for twelve. Usage allowances and credits reset each billing month.",
      "Usage and remaining credits are shown in your account. Limits are applied by the server, so they are the same across every device.",
    ],
    links: [
      { label: "Pricing", to: "/pricing" },
      { label: "Usage", to: "/usage" },
      { label: "Refund policy", to: "/refund" },
    ],
  },
  {
    id: "privacy",
    heading: "Data and privacy",
    body: [
      "Your conversations, files and generated media are private to your account and protected by row-level access rules in the database.",
      "You can delete conversations and your account from settings.",
    ],
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Data controls", to: "/settings/data-controls" },
    ],
  },
];

const DocsPage = () => {
  const location = useLocation();

  return (
    <>
      <SEOHead
        title="Documentation"
        description="How Megsy AI works: chat and models, deep research, image and video generation, skills, integrations, plans and data privacy."
        path="/docs"
        noindex={location.pathname !== "/docs"}
      />
      <main className="mx-auto min-h-dvh w-full max-w-3xl px-5 py-12 text-foreground sm:px-8 sm:py-16">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Megsy documentation</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A practical reference for everything Megsy can do today.
          </p>
        </header>

        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-border bg-card p-4">
          <ul className="grid list-none gap-2 p-0 text-sm sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a className="text-muted-foreground hover:text-foreground" href={`#${s.id}`}>
                  {s.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              {section.body.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {section.links && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {section.links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="rounded-full border border-border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" to="/blog">Blog</Link>
          <Link className="hover:text-foreground" to="/contact">Contact</Link>
          <Link className="hover:text-foreground" to="/terms">Terms</Link>
        </nav>
      </main>
    </>
  );
};

export default DocsPage;
