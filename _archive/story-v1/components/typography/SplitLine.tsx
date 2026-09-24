import { useMemo } from "react";

interface Props {
  text: string;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  /** Splits into characters instead of words, for kinetic treatments. */
  chars?: boolean;
}

/**
 * Wraps each word (or character) so a timeline can move them independently.
 * The full string stays in the accessibility tree as one label.
 */
export function SplitLine({ text, className, as: Tag = "p", chars = false }: Props) {
  const parts = useMemo(() => (chars ? Array.from(text) : text.split(" ")), [text, chars]);

  return (
    <Tag className={className} aria-label={text}>
      {parts.map((part, i) => (
        <span className="split-unit" key={`${part}-${i}`} aria-hidden="true">
          <span className="split-inner" data-split-inner>
            {part === " " ? " " : part}
          </span>
          {!chars && i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
