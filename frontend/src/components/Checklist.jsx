// Symptom / warning-sign / background checklist.
// These answers are NOT sent to the prediction model or the server. They stay
// in the browser and only shape the emergency warning and the "Next steps" advice.
export default function Checklist({ checklist, checked, onToggle, emergencyNumber }) {
  const emergencyItems = checklist.emergency?.items || [];
  const anyEmergency = emergencyItems.some((item) => checked[item.id]);

  const renderGroup = (group, className = "") => {
    if (!group) return null;
    return (
      <div className={`check-group ${className}`}>
        <h3 className="check-group-title">{group.title}</h3>
        {group.intro && <p className="check-group-intro">{group.intro}</p>}
        <div className="check-items">
          {group.items.map((item) => (
            <label className="check-item" key={item.id}>
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => onToggle(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="checklist">
      <h2>Symptoms and background</h2>
      <p className="checklist-note">
        Optional, but worth a minute. These answers don't change your percentage. They shape the
        advice you get afterwards, and they stay on your device: nothing here is sent or saved.
      </p>

      {renderGroup(checklist.emergency, "emergency")}

      {anyEmergency && (
        <div className="emergency-alert" role="alert">
          <strong>This may be an emergency.</strong> Call{" "}
          <a href={`tel:${emergencyNumber}`}>{emergencyNumber}</a> or go to the nearest hospital
          now. Don't wait for this check.
        </div>
      )}

      {renderGroup(checklist.symptoms)}
      {renderGroup(checklist.history)}
    </div>
  );
}