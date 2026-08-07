import React from 'react';

/**
 * [INLINE PILLAR HIGHLIGHT SPAN]
 * Highlights specific prompt phrases inline within natural text flow using the matching pillar color.
 * Clean and simple: no popups, no hover tooltips, no separate label badges.
 */
export default function PillarHighlightSpan({ text, pillarObj }) {
  if (!pillarObj) {
    return <span>{text}</span>;
  }

  const hexColor = pillarObj.color || '#8b5cf6';

  return (
    <span
      className="rounded px-1 py-0.5 my-0.5 mx-0.5 font-medium inline transition-colors"
      style={{
        backgroundColor: `${hexColor}30`,
        borderBottom: `2px solid ${hexColor}`,
        color: '#f3f4f6'
      }}
    >
      {text}
    </span>
  );
}
