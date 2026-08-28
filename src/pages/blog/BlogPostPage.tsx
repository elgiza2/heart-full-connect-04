/**
 * @doc Public blog post page. Renders Markdown through react-markdown (no raw
 * HTML pass-through, so stored `content_html` is intentionally ignored) and
 * emits Article JSON-LD. Unknown slugs render a real not-found state instead of
 * a 200 chat page.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import SEOHead from "@/components/common/SEOHead";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  meta_description: string | null;
  content_md: string;
  hero_image_url: string | null;
  author_name: string;
  published_at: string | null;
  updated_at: string;
  reading_minutes: number | null;
  category: string | null;
}

const BlogPostPage = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select(
          "slug,title,excerpt,meta_description,content_md,hero_image_url,author_name,published_at,updated_at,reading_minutes,category",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setState("missing");
        return;
      }
      setPost(data as Post);
      setState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-3xl px-5 py-16" aria-busy="true">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted/60" />
          ))}
        </div>
      </main>
    );
  }

  if (state === "missing" || !post) {
    return (
      <>
        <SEOHead
          title="Post not found"
          description="This Megsy AI blog post does not exist."
          path={`/blog/${slug}`}
          noindex
        />
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold">Post not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This article isn’t published or the link is mistyped.
          </p>
          <Link
            to="/blog"
            className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted"
          >
            Back to the blog
          </Link>
        </main>
      </>
    );
  }

  const description =
    post.meta_description || post.excerpt || `${post.title} — an article from the Megsy AI blog.`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={description}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.hero_image_url || undefined}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            image: post.hero_image_url || undefined,
            datePublished: post.published_at || undefined,
            dateModified: post.updated_at,
            author: { "@type": "Person", name: post.author_name },
            publisher: { "@type": "Organization", name: "Megsy AI" },
            mainEntityOfPage: `https://megsyai.com/blog/${post.slug}`,
          })}
        </script>
      </Helmet>

      <main className="mx-auto min-h-dvh w-full max-w-3xl px-5 py-12 text-foreground sm:px-8 sm:py-16">
        <Link to="/blog" className="text-xs text-muted-foreground hover:text-foreground">
          ← All posts
        </Link>

        <article className="mt-6">
          <header>
            {post.category && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {post.category}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-xs text-muted-foreground">
              {post.author_name}
              {post.published_at
                ? ` · ${new Date(post.published_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}`
                : ""}
              {post.reading_minutes ? ` · ${post.reading_minutes} min read` : ""}
            </p>
          </header>

          {post.hero_image_url && (
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="mt-8 w-full rounded-2xl border border-border object-cover"
            />
          )}

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none prose-headings:tracking-tight prose-a:text-primary">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="nofollow noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {post.content_md}
            </ReactMarkdown>
          </div>
        </article>

        <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" to="/blog">Blog</Link>
          <Link className="hover:text-foreground" to="/docs">Docs</Link>
          <Link className="hover:text-foreground" to="/pricing">Pricing</Link>
          <Link className="hover:text-foreground" to="/chat">Open Megsy</Link>
        </nav>
      </main>
    </>
  );
};

export default BlogPostPage;
