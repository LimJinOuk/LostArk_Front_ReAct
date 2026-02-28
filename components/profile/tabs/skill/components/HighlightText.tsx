import React from "react";

// Highlight values/keywords inside descriptions for readability.

export function SkillHighlightText({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(
    /([\d,.]*\d)(?=(?:\s?의\s?|\s?)피해)|([\d,.]*\d\s?초)|([\d,.]*\d\s?m|[\d,.]*\d\s?회)|(이동|휘두름|돌진|도약|점프|발사)/g
  );

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const nextText = parts.slice(i + 1).join("");

        if (
          /^[\d,.]+$/.test(part) &&
          (nextText.trim().startsWith("의 피해") || nextText.trim().startsWith("피해"))
        )
          return (
            <span key={i} className="text-red-500 font-bold">
              {part}
            </span>
          );

        if (/[\d,.]+\s?(?:초|m|회)/.test(part))
          return (
            <span key={i} className="text-emerald-400 font-bold">
              {part}
            </span>
          );

        if (/(이동|휘두름|돌진|도약|점프|발사)/.test(part))
          return (
            <span key={i} className="text-purple-400 font-bold">
              {part}
            </span>
          );

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function TripodHighlightText({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(
    /(\[상\]|\[중\]|\[하\])|([\d,.]*\d\s?%|[\d,.]*\d\s?(?:m|회|초)|[\d,.]*\d)/g
  );

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const nextText = parts.slice(i + 1).join("");

        if (/\[상\]|\[중\]|\[하\]/.test(part) && nextText.includes("증가"))
          return (
            <span key={i} className="text-emerald-400 font-bold">
              {part}
            </span>
          );

        if (!/\d/.test(part) && !/\[상\]|\[중\]|\[하\]/.test(part))
          return <span key={i}>{part}</span>;

        const prevText = parts.slice(0, i).join("");

        if ((part.includes("%") || part.includes("초")) && nextText.trim().startsWith("감소"))
          return (
            <span key={i} className="text-red-500 font-bold">
              {part}
            </span>
          );

        if (part.includes("%") && nextText.trim().startsWith("증가"))
          return (
            <span key={i} className="text-emerald-400 font-bold">
              {part}
            </span>
          );

        if (nextText.includes("피해") || (part.includes("%") && (nextText.includes("피해") || prevText.includes("피해"))))
          return (
            <span key={i} className="text-red-500 font-bold">
              {part}
            </span>
          );

        if (/[m회초]/.test(part))
          return (
            <span key={i} className="text-emerald-400 font-bold">
              {part}
            </span>
          );

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

