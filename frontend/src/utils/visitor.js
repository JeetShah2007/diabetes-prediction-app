// Anonymous per-browser ID, sent with every request so the server can keep
// each visitor's history separate. Not a login: clearing browser data
// creates a new ID (and a fresh, empty history).
let memoryId = null;

function makeId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return "v-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem("healthcheck_visitor_id");
    if (!id) {
      id = makeId();
      localStorage.setItem("healthcheck_visitor_id", id);
    }
    return id;
  } catch (err) {
    // localStorage blocked (e.g. private mode): fall back to a per-tab ID
    if (!memoryId) memoryId = makeId();
    return memoryId;
  }
}

export function visitorHeaders() {
  return { "X-Visitor-Id": getVisitorId() };
}
