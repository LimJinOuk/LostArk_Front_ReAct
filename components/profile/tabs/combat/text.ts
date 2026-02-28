// Text helpers used across Combat tab.

export function cleanText(text: any): string {
  if (!text) return "";

  if (typeof text === "string") {
    return text.replace(/<[^>]*>?/gm, "").trim();
  }

  // Some tooltips can be objects with a Text field.
  if (typeof text === "object" && typeof text.Text === "string") {
    return cleanText(text.Text);
  }

  return "";
}

export function engravingDescToHtml(desc: string) {
  if (!desc) return "";

  // Convert <FONT COLOR='#99ff99'>text</FONT> to <span style="color:#99ff99">text</span>
  let html = desc
    .replace(
      /<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g,
      `<span style="color:$1">`
    )
    .replace(/<\/FONT>/g, `</span>`);

  // Preserve new lines.
  html = html.replace(/\n/g, "<br />");

  return html;
}

