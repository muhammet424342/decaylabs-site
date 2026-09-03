import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/subject-share.js";

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
}

test("renders exact Subject metadata and launches the canonical record", () => {
  const response = responseMock();
  handler({ query: { id: "846" } }, response);
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Subject #0846/);
  assert.match(response.body, /\/846\.webp/);
  assert.match(response.body, /\/subject\?id=846/);
  assert.match(response.body, /launch_miniapp/);
  assert.equal(response.headers["X-Robots-Tag"], "noindex, follow");
});

test("rejects out-of-range Subject IDs without rendering metadata", () => {
  const response = responseMock();
  handler({ query: { id: "1001" } }, response);
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.Location, "https://decaylabs.online/collection");
});
