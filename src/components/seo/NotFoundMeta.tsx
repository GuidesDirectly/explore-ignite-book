import { useEffect } from "react";

interface NotFoundMetaProps {
  title?: string;
}

/**
 * Injects SEO signals so crawlers treat this view as a real 404,
 * eliminating Google Search Console "Soft 404" reports for SPA routes.
 */
const NotFoundMeta = ({ title = "Page Not Found | Guides Directly" }: NotFoundMetaProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const tags: HTMLMetaElement[] = [];

    const addMeta = (name: string, content: string) => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      m.setAttribute("content", content);
      m.setAttribute("data-notfound-meta", "true");
      document.head.appendChild(m);
      tags.push(m);
    };

    addMeta("robots", "noindex, nofollow");
    addMeta("googlebot", "noindex, nofollow");
    addMeta("prerender-status-code", "404");

    return () => {
      document.title = previousTitle;
      tags.forEach((t) => t.parentNode?.removeChild(t));
    };
  }, [title]);

  return null;
};

export default NotFoundMeta;
