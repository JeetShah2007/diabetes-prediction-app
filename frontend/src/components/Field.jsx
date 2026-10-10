// Renders one form field based on its type. "bmi" fields are special-cased
// inline in HealthCheckPage since they need two linked inputs (height/weight).
export default function Field({ field, value, onChange }) {
  const normalizedOptions = (field.options || []).map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className="field">
      <label htmlFor={field.key}>{field.label}</label>

      {field.type === "number" && (
        <input
          id={field.key}
          name={field.key}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          required
        />
      )}

      {field.type === "select" && (
        <select
          id={field.key}
          name={field.key}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          required
        >
          <option value="" disabled>
            Select...
          </option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "toggle" && (
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${value === 1 ? "active" : ""}`}
            onClick={() => onChange(field.key, 1)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`toggle-btn ${value === 0 ? "active" : ""}`}
            onClick={() => onChange(field.key, 0)}
          >
            No
          </button>
        </div>
      )}

      {field.hint && <span className="hint">{field.hint}</span>}
    </div>
  );
}
