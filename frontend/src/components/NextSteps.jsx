// Plain-language "what to do next" box shown under the result. It combines the
// model's result with the checklist answers, using simple, visible rules:
//   urgent  -> any warning sign ticked
//   soon    -> higher-risk result, or any symptom ticked, or 3+ background items
//   routine -> everything else
export default function NextSteps({ config, result, checkedIds, emergencyNumber }) {
  const groupItems = (name) => config.checklist?.[name]?.items || [];
  const pick = (items) => items.filter((item) => checkedIds.includes(item.id));

  const emergencyHits = pick(groupItems("emergency"));
  const symptomHits = pick(groupItems("symptoms"));
  const historyHits = pick(groupItems("history"));

  let level = "routine";
  if (emergencyHits.length > 0) level = "urgent";
  else if (result.prediction === 1 || symptomHits.length > 0 || historyHits.length >= 3) level = "soon";

  const content = {
    urgent: {
      icon: "🚨",
      title: "Get medical help now",
      body: `You marked warning signs that can be an emergency. Call ${emergencyNumber} or go to the nearest hospital right away. Don't wait for an appointment.`,
    },
    soon: {
      icon: "📅",
      title: "Please see a doctor soon",
      body: "Your result and the answers you gave suggest it's worth getting checked properly. Book an appointment and take any recent test reports with you.",
    },
    routine: {
      icon: "🌿",
      title: "Keep looking after your health",
      body: "A lower estimate is reassuring, but it doesn't rule anything out. Keep up regular checkups, and see a doctor if you notice new symptoms.",
    },
  }[level];

  const mention = [...symptomHits, ...historyHits];

  return (
    <div className={`next-steps ${level}`}>
      <div className="next-steps-head">
        <span className="next-steps-icon">{content.icon}</span>
        <h3>{content.title}</h3>
      </div>
      <p>{content.body}</p>

      {emergencyHits.length > 0 && (
        <>
          <h4>Warning signs you marked</h4>
          <ul>
            {emergencyHits.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </>
      )}

      {mention.length > 0 && (
        <>
          <h4>Tell your doctor about</h4>
          <ul>
            {mention.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </>
      )}

      {config.testsToAsk?.length > 0 && (
        <>
          <h4>Tests you can ask about</h4>
          <ul>
            {config.testsToAsk.map((test) => (
              <li key={test}>{test}</li>
            ))}
          </ul>
        </>
      )}

      <p className="next-steps-foot">
        After this check, please also consult a doctor. Only a doctor can examine you, order the
        right tests and confirm anything.
      </p>
    </div>
  );
}