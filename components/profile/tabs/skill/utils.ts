// Utilities for Skill tab (tooltip cleanup, modal placement).

export function getModalPosition(anchorRect: DOMRect) {
  const top = anchorRect.top + anchorRect.height + window.scrollY;
  let left = anchorRect.left + window.scrollX + anchorRect.width / 2;

  const modalWidth = 256;
  const padding = 12;

  if (left - modalWidth / 2 < padding) left = modalWidth / 2 + padding;
  if (left + modalWidth / 2 > window.innerWidth - padding)
    left = window.innerWidth - modalWidth / 2 - padding;

  return { top, left };
}

export function cleanHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

