export const marketInstrumentNames = [
  "taker",
  "maker",
  "omega",
  "tempo",
  "proof",
] as const;

export type MarketInstrumentName = (typeof marketInstrumentNames)[number];

type MarketInstrumentProps = {
  name: MarketInstrumentName;
  size?: number;
  className?: string;
  title?: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

function renderInstrument(name: MarketInstrumentName) {
  switch (name) {
    case "taker":
      return (
        <>
          <path d="M8 32h26M27 23l9 9-9 9M47 17v-5M47 52v-5" {...stroke} />
          <circle cx="47" cy="32" r="9" fill="currentColor" />
        </>
      );
    case "maker":
      return (
        <>
          <path d="M32 10v44M15 20h34M12 32h40M17 44h30" {...stroke} />
          {[
            [15, 20],
            [49, 20],
            [12, 32],
            [52, 32],
            [17, 44],
            [47, 44],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="currentColor" />
          ))}
        </>
      );
    case "omega":
      return (
        <>
          <circle cx="32" cy="32" r="21" {...stroke} />
          <path d="M5 32h18M41 32h18" {...stroke} />
          <circle cx="32" cy="32" r="11" fill="currentColor" />
        </>
      );
    case "tempo":
      return (
        <>
          <path d="M8 19h29l8 8h11M8 32h48M8 45h11l8-8h29" {...stroke} />
          {[
            [8, 19],
            [56, 32],
            [8, 45],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="currentColor" />
          ))}
        </>
      );
    case "proof":
      return (
        <>
          <path d="M17 8h23l9 9v39H17zM40 8v10h9M24 28h18M24 36h12" {...stroke} />
          <circle cx="41" cy="44" r="8" {...stroke} />
          <path d="m37.5 44 2.5 2.5 5-5" {...stroke} />
        </>
      );
    default: {
      const exhaustive: never = name;
      return exhaustive;
    }
  }
}

export function MarketInstrument({
  name,
  size = 48,
  className,
  title,
}: MarketInstrumentProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {renderInstrument(name)}
    </svg>
  );
}
