import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type Props = { content: string };

export function MarkdownBody({ content }: Props) {
  return (
    <div
      className={[
        "prose max-w-none dark:prose-invert",
        "prose-headings:text-foreground prose-headings:scroll-mt-24",
        "prose-p:text-[var(--muted)] prose-li:text-[var(--muted)]",
        "prose-strong:text-foreground",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-accent prose-code:bg-[var(--code-bg)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-[var(--code-bg)] prose-pre:border prose-pre:border-[var(--card-border)] prose-pre:rounded-xl",
        "prose-pre:text-foreground prose-pre:p-4",
        "prose-blockquote:border-accent prose-blockquote:text-muted",
        "prose-table:text-sm prose-th:border prose-th:border-[var(--card-border)] prose-td:border prose-td:border-[var(--card-border)]",
        "prose-hr:border-[var(--card-border)]",
        "prose-img:rounded-xl prose-img:border prose-img:border-[var(--card-border)] max-w-full",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return (
              <pre className="hljs overflow-x-auto !bg-[var(--code-bg)] !p-4 rounded-xl border border-[var(--card-border)]">
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
