interface MetaInput {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

/** Per-route metadata for a client-rendered app. Drafts are never indexed. */
export function setMeta({ title, description, image, canonical, noindex }: MetaInput) {
  document.title = title;

  if (description) {
    upsert('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    }).setAttribute("content", description);
  }

  upsert('meta[property="og:title"]', () => {
    const m = document.createElement("meta");
    m.setAttribute("property", "og:title");
    return m;
  }).setAttribute("content", title);

  if (image) {
    upsert('meta[property="og:image"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image");
      return m;
    }).setAttribute("content", image);
  }

  if (canonical) {
    const link = upsert('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }) as HTMLLinkElement;
    link.href = new URL(canonical, window.location.origin).toString();
  }

  const robots = upsert('meta[name="robots"]', () => {
    const m = document.createElement("meta");
    m.setAttribute("name", "robots");
    return m;
  });
  robots.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");
}
