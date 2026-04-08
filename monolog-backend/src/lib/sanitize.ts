import DOMPurify from "isomorphic-dompurify";

/**
 * Clean HTML content to prevent stored XSS attacks.
 * We whitelist a conservative set of tags suitable for a technical blog.
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "hr", "img", "div", "span", "details", "summary", "table", "thead",
      "tbody", "tr", "th", "td"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel", "id"],
    // Automatically add noopener/noreferrer to external links
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"]
  });
};

/**
 * Basic text-only sanitization for simple inputs like author names or categories.
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};
