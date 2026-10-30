// Panel of outside links. Every link opens in a new tab.
function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (err) {
    return url;
  }
}

export default function ResourceLinks({ title, sections, emergencyNumber }) {
  return (
    <div className="panel resources-panel">
      <h2>{title}</h2>

      {emergencyNumber && (
        <div className="resource-emergency">
          🚑 In an emergency, call <a href={`tel:${emergencyNumber}`}>{emergencyNumber}</a>{" "}
          straight away.
        </div>
      )}

      {sections.map((section) => (
        <div className="resource-section" key={section.heading}>
          <h3>{section.heading}</h3>
          <div className="resource-grid">
            {section.items.map((item) => (
              <a
                className="resource-card"
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="resource-label">{item.label} ↗</span>
                <span className="resource-note">{item.note}</span>
                <span className="resource-host">{hostOf(item.url)}</span>
              </a>
            ))}
          </div>
        </div>
      ))}

      <p className="resource-disclaimer">
        These are independent websites that open in a new tab. We are not connected to them.
        Always confirm anything you read with your doctor.
      </p>
    </div>
  );
}