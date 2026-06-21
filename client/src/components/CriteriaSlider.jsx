export default function CriteriaSlider({ label, value, onChange, disabled }) {
  const num = Number(value) || 0;

  return (
    <div className="criteria-slider">
      <div className="criteria-slider-head">
        <span className="criteria-label">{label}</span>
        <span className="criteria-value">{num}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={num}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="criteria-range"
        style={{ '--pct': `${num}%` }}
      />
    </div>
  );
}
