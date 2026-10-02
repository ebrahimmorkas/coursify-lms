import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders instructor-authored Markdown. react-markdown does not render raw HTML,
 * so lesson content cannot inject scripts (XSS-safe by default).
 */
export function LessonContent({ content }: { content: string }) {
  return (
    <div className="prose-lesson">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
