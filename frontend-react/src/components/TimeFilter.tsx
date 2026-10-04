/** Slider stops, left to right. `null` = no filter ("Any"), the default at the right end. */
const STOPS: ReadonlyArray<{ value: number | null; label: string }> = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
  { value: null, label: 'Any' },
];
const ANY_INDEX = STOPS.length - 1;

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function TimeFilter({ value, onChange }: Props) {
  // Fully controlled: the thumb position is derived from `value`.
  const found = STOPS.findIndex((s) => s.value === value);
  const index = found === -1 ? ANY_INDEX : found;

  const current = value === null ? 'Any length' : `Up to ${value} min`;
  const valueText = value === null ? 'Any length' : `Up to ${value} minutes`;

  return (
    <div className="time-filter">
      <div className="time-filter-head">
        <label htmlFor="time-available">Time available</label>
        <span className="time-filter-current">{current}</span>
      </div>
      {/* Only four stops, so a drag causes at most three requests; each is cancelled when superseded by the AbortController in App. */}
      <input
        id="time-available"
        type="range"
        min={0}
        max={STOPS.length - 1}
        step={1}
        value={index}
        aria-valuetext={valueText}
        onChange={(e) => onChange(STOPS[Number(e.target.value)].value)}
      />
      <div className="time-filter-stops" aria-hidden="true">
        {STOPS.map((s) => (
          <span key={s.label}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}
