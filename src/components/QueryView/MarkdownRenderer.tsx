import { useState, useEffect } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStarryNight from "rehype-starry-night";
import rehypeReact from "rehype-react";
import { createElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

// Component to render markdown with syntax highlighting
export function MarkdownRenderer({ content }: { content: string }) {
  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );
  const [rendered, setRendered] = useState<React.ReactElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Process markdown asynchronously
  useEffect(() => {
    let cancelled = false;
    setIsProcessing(true);

    // Create processor with theme-aware syntax highlighting
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStarryNight, {
        theme: isDark ? "github-dark" : "github-light",
      })
      .use(rehypeReact, { createElement, Fragment, jsx, jsxs });

    processor
      .process(content)
      .then((result: any) => {
        if (!cancelled) {
          setRendered(result.result as React.ReactElement);
          setIsProcessing(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Markdown rendering error:", error);
          setRendered(
            <span className="text-destructive">Error rendering markdown</span>
          );
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content, isDark]);

  if (isProcessing && rendered === null) {
    return <span className="text-muted-foreground">Rendering...</span>;
  }

  return <>{rendered}</>;
}
