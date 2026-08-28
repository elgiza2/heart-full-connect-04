/**
 * @doc Public blog index. `/blog` used to redirect to Chat (soft 404), so 138
 * published posts were invisible to users and crawlers. Reads published posts
 * directly from Postgres — anonymous read is allowed by RLS for published rows
 * only, so no draft ever reaches the browser.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { supabase } from "@/integrations/supabase/client";

interface PostCard {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_image_url: string | null;
  published_at: string | null;
  reading_minutes: number | null;
}

const PAGE_SIZE = 24;

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

const BlogIndexPage = () => {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,category,hero_image_url,published_at,reading_minutes")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(PAGE_SIZE);
      if (cancelled) return;
      if (err) setError("Posts could not be loaded right now.");
      else setPosts((data as PostCard[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Blog"
        description="Guides, product updates and practical AI workflows from the Megsy AI team."
        path="/blog"
      />
      <main className="mx-auto min-h-dvh w-full max-w-5xl px-5 py-12 text-foreground sm:px-8 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Megsy Blog</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Guides, product updates and practical workflows for working with AI models, research
            and media generation.
          </p>
        </header>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts published yet.</p>
        )}

        {!loading && posts.length > 0 && (
          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/25"
                >
                  {post.hero_image_url ? (
                    <img
                      src={post.hero_image_url}
                      alt=""
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-muted/50" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {post.category && (
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-base font-semibold leading-snug group-hover:underline">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="mt-auto pt-2 text-xs text-muted-foreground">
                      {formatDate(post.published_at)}
                      {post.reading_minutes ? ` · ${post.reading_minutes} min read` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" to="/chat">Open Megsy</Link>
          <Link className="hover:text-foreground" to="/pricing">Pricing</Link>
          <Link className="hover:text-foreground" to="/docs">Docs</Link>
        </nav>
      </main>
    </>
  );
};

export default BlogIndexPage;
