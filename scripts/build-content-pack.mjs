import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const calendar = fs.readFileSync(path.join(root, "ops/x/30-day-calendar.md"), "utf8");
const ideasText = fs.readFileSync(path.join(root, "ops/x/100-post-ideas.md"), "utf8");
const dayBlocks = [...calendar.matchAll(/## Day (\d+)\s+[^\n]*\n\n([\s\S]*?)(?=\n## Day |\n## Daily supporting|$)/g)].map((m) => {
  const body = m[2];
  const field = (name) => body.split("\\n").find((line) => line.startsWith(`- ${name}:`))?.replace(new RegExp(`^- ${name}:\\\\s*`), "").replace(/^`|`$/g, "") || "";
  const time = field("Time") || "18:30 TRT";
  const main = field("Main");
  const hook = field("Hook");
  return { day: Number(m[1]), hook, tweet: `${hook}\n\n${main}`, cta: field("CTA"), visual: field("Visual"), altText: `DecayLabs archive visual for day ${m[1]}: ${hook}`, time, purpose: "discover + trust + conversation", prePublishReply: "A small archive note before today’s signal: read the evidence, then bring a theory.", postPublishEngagement: "Reply to every genuine comment with one specific question or one piece of evidence within 20 minutes." };
});
const ideas = [...ideasText.matchAll(/^\d+\. `([^`]+)`/gm)].map((m, i) => ({ id: i + 1, hook: m[1], tweet: m[1], visual: "Minimal archive type card or relevant Subject artwork", altText: `DecayLabs post visual: ${m[1]}`, cta: "Reply with your reading and share the evidence.", purpose: "conversation + saves + discovery" }));
const replies = [
  "The strongest part is the constraint. What did you deliberately leave out of the first release?",
  "Base makes the transaction accessible; the harder work is giving people a reason to return.",
  "I like when provenance is treated as a starting point instead of the whole story.",
  "What would you publish if the floor price disappeared tomorrow?",
  "A useful build log names the failure as clearly as the feature.",
  "This is a good reminder that community is a practice, not a Discord channel.",
  "Which detail is verifiable today, and which part is still research?",
  "The visual clue works because it leaves room for the reader to be wrong.",
  "I would test the smallest version first and publish the result either way.",
  "An onchain record can preserve the receipt; people preserve the meaning.",
  "The question is stronger than a promise here. What answer surprised you most?",
  "If holders can explain why they chose a piece, the collection has started to travel.",
  "What is the one metric you would keep if every vanity metric vanished?",
  "This feels like a builder update, not a launch announcement. That difference matters.",
  "The safest CTA is the one that lets someone verify before they decide.",
  "I would love to see the rejected version too. Constraints become useful when documented.",
  "Lore gets durable when each answer creates a better question.",
  "A small, finished artifact beats a large untested roadmap.",
  "Which assumption did the first users challenge?",
  "The contract is important, but the habit of checking it is the real education.",
  "This is the kind of transparency that compounds quietly.",
  "Can you show the exact test that protects this interaction?",
  "The best collaborations begin with a shared object, not a shared logo.",
  "I would choose the option with the clearest downside and document it.",
  "A faction system gives collectors a language for discussing the work.",
  "What happens to the canon when the community disagrees?",
  "The restraint around unbuilt utility is refreshing.",
  "One precise example would make this principle easier to apply.",
  "The archive framing makes the collection feel connected without flattening every piece.",
  "How do you decide which community theory becomes canon?",
  "Good reminder: an audience that can verify is more valuable than an audience that only amplifies.",
  "I would save this checklist for every marketplace link I open.",
  "The most convincing roadmap item is the one with a working link.",
  "What would make a newcomer feel safe in the first five minutes?",
  "This is a strong use of scarcity: attention follows context, not manufactured panic.",
  "The unanswered detail is doing more work than a paragraph of exposition.",
  "A creator saying ‘not built’ is useful product information.",
  "Which part of the system is intentionally boring but essential?",
  "The reply prompt is specific enough to invite a real answer.",
  "I would rather see one honest limitation than five vague benefits.",
  "This could become a great public test case for new collectors.",
  "The visual and the copy agree on the same question, which makes the post memorable.",
  "What is the smallest next proof you can ship?",
  "A living archive needs version history. Will you keep the old records visible?",
  "The distinction between owner, witness and reader is fascinating.",
  "This is a healthy way to use FOMO: invite attention, never pressure a purchase.",
  "If the community can add evidence, the lore becomes a shared instrument.",
  "I would start with the public contract page before making any buying decision.",
  "The strongest projects make the next action obvious and the risks visible.",
  "What did you learn from the part that did not work?"
];
const profile = { displayName: "DecayLabs | Half-Life Archive", username: "@Decaylabss", bio: "Everything decays. Proof remains.\nThe Half-Life Archive — 1,000 Subjects on Base.\nLore, provenance, and an honest build log.", website: "https://decaylabs.online", location: "Vanta / Base", avatar: "public/x-avatar.png", banner: "public/x-banner.jpg", ogImage: "public/og-v2.png" };
const pinnedThread = ["DecayLabs — Everything Decays. Proof Remains.", "Half-Life Archive: 1,000 Subjects, five factions, one sealed city called Vanta.", "Every Subject is a witness with a record, a memory fragment and a chapter connection.", "The collection, lore, contract and safer checkout are public. No invented rarity. No guaranteed utility.", "Enter the archive: https://decaylabs.online — verify first, then choose your next witness."];
fs.mkdirSync(path.join(root, "ops/x"), { recursive: true });
fs.writeFileSync(path.join(root, "ops/x/final-publishing-pack.json"), JSON.stringify({ generatedAt: new Date().toISOString(), profile, pinnedThread, firstSevenDays: dayBlocks.slice(0, 7), days30: dayBlocks, ideas100: ideas, replies50: replies }, null, 2) + "\n");
console.log(JSON.stringify({ days: dayBlocks.length, ideas: ideas.length, replies: replies.length }, null, 2));
