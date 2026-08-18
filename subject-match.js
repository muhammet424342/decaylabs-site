const FACTIONS = ["rustbound", "sporekin", "glass-saints", "staticborn", "bone-cartographers"];

export function validMatchAnswers(answers) {
  return Array.isArray(answers)
    && answers.length === 3
    && answers.every((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) < 5);
}

export function matchSubjectId(answers) {
  if (!validMatchAnswers(answers)) throw new RangeError("Three answers between 0 and 4 are required.");
  const [identity, evidence, response] = answers.map(Number);
  const factionIndex = identity;
  const seed = ((identity + 1) * 131 + (evidence + 1) * 47 + (response + 1) * 89) % 200;
  return factionIndex + 1 + (seed * 5);
}

export function matchFactionId(answers) {
  if (!validMatchAnswers(answers)) throw new RangeError("Three answers between 0 and 4 are required.");
  return FACTIONS[Number(answers[0])];
}

export function encodeMatchAnswers(answers) {
  if (!validMatchAnswers(answers)) return "";
  return answers.map(Number).join("-");
}

export function decodeMatchAnswers(value) {
  const answers = String(value || "").split("-").map(Number);
  return validMatchAnswers(answers) ? answers : null;
}
