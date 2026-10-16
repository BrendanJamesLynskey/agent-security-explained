/**
 * This site's favicon glyph (src/app/icon.svg) and its card's graphic.
 * Glyph: the bubble of the Agents track, the letter S, #0e7490.
 */
import { CIRCLE_COLOUR, DECISION_COLOUR } from "@/lib/viz/palette";

export function Glyph({ size }: { size: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="0.5" y="1" width="31" height="24" rx="6" fill="#0e7490" />
      <path d="M6 23v8.5l8.5-8.5z" fill="#0e7490" />
      <path
        d="M20.56 16.12Q20.56 17.98 19.22 19.09Q17.87 20.2 15.4 20.2Q13.19 20.2 11.44 19.35V16.59Q12.44 17.02 13.51 17.38Q14.58 17.75 15.64 17.75Q16.74 17.75 17.2 17.32Q17.66 16.9 17.66 16.25Q17.66 15.73 17.29 15.35Q16.93 14.98 16.32 14.66Q15.72 14.33 14.93 13.96Q14.44 13.73 13.87 13.4Q13.3 13.08 12.78 12.6Q12.26 12.12 11.93 11.43Q11.6 10.75 11.6 9.78Q11.6 7.9 12.87 6.85Q14.15 5.8 16.34 5.8Q17.44 5.8 18.43 6.06Q19.42 6.31 20.5 6.78L19.54 9.1Q18.58 8.71 17.81 8.49Q17.05 8.27 16.25 8.27Q15.4 8.27 14.95 8.67Q14.5 9.06 14.5 9.69Q14.5 10.43 15.17 10.86Q15.83 11.29 17.15 11.92Q18.23 12.43 18.98 12.98Q19.74 13.53 20.15 14.27Q20.56 15.02 20.56 16.12Z"
        fill="#fff"
      />
    </svg>
  );
}

/** The landing hero's trifecta: private data, untrusted input and a way out; where all three meet, the policy denies the flow. */
export function Motif(): JSX.Element {
  const C: [number, number, string][] = [
    [168, 160, CIRCLE_COLOUR.private!],
    [272, 160, CIRCLE_COLOUR.untrusted!],
    [220, 250, CIRCLE_COLOUR.outbound!],
  ];
  return (
    <svg width="440" height="420" viewBox="0 0 440 420">
      {C.map(([x, y, c]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={104}
          fill={c}
          fillOpacity={0.28}
          stroke={c}
          strokeWidth={5}
        />
      ))}
      <circle
        cx={220}
        cy={190}
        r={26}
        fill="#0b1020"
        stroke={DECISION_COLOUR.deny}
        strokeWidth={6}
      />
      <path
        d="M209 179 231 201M231 179 209 201"
        stroke={DECISION_COLOUR.deny}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}
