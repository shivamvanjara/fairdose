import assert from "node:assert/strict";
import { test } from "node:test";
import handler from "./vision.js";

const allowedOrigin = "https://fairdose.vercel.app";

function createResponse() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

async function invoke({ method = "POST", origin = allowedOrigin, body } = {}) {
  const res = createResponse();
  await handler({
    method,
    headers: { origin, "content-type": "application/json" },
    body
  }, res);
  return res;
}

test("rejects methods other than POST", async () => {
  const response = await invoke({ method: "GET" });

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "POST");
});

test("rejects unapproved origins", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  const response = await invoke({ origin: "https://untrusted.example" });

  assert.equal(response.statusCode, 403);
});

test("rejects non-JSON requests", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  const res = createResponse();

  await handler({
    method: "POST",
    headers: { origin: allowedOrigin, "content-type": "text/plain" },
    body: {}
  }, res);

  assert.equal(res.statusCode, 415);
});

test("fails closed when the Vision key is not configured", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  delete process.env.GOOGLE_VISION_API_KEY;
  const response = await invoke();

  assert.equal(response.statusCode, 503);
});

test("rejects invalid image payloads", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  const response = await invoke({
    body: {
      captchaToken: "test-token",
      imageBase64: "not-base64",
      mimeType: "image/png"
    }
  });

  assert.equal(response.statusCode, 400);
});

test("rejects missing verification tokens", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  const response = await invoke({
    body: { imageBase64: "aGVsbG8=", mimeType: "image/png" }
  });

  assert.equal(response.statusCode, 400);
});

test("does not call Vision when Turnstile rejects the token", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    return { ok: true, json: async () => ({ success: false }) };
  };

  try {
    const response = await invoke({
      body: {
        captchaToken: "invalid-token",
        imageBase64: "aGVsbG8=",
        mimeType: "image/png"
      }
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, "Request verification failed.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fails closed when Turnstile is not configured", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  delete process.env.TURNSTILE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("External services must not be called without Turnstile configuration.");
  };

  try {
    const response = await invoke({
      body: {
        captchaToken: "test-token",
        imageBase64: "aGVsbG8=",
        mimeType: "image/png"
      }
    });

    assert.equal(response.statusCode, 503);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a token issued for a different hostname", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: "prescription_scan",
      hostname: "attacker.example"
    })
  });

  try {
    const response = await invoke({
      body: {
        captchaToken: "wrong-host-token",
        imageBase64: "aGVsbG8=",
        mimeType: "image/png"
      }
    });

    assert.equal(response.statusCode, 403);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns only recognized text from the Vision response", async () => {
  process.env.FAIRDOSE_ALLOWED_ORIGINS = allowedOrigin;
  process.env.GOOGLE_VISION_API_KEY = "test-key";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      assert.equal(options.body.get("secret"), "test-secret");
      assert.equal(options.body.get("response"), "valid-token");
      return {
        ok: true,
        json: async () => ({
          success: true,
          action: "prescription_scan",
          hostname: "fairdose.vercel.app"
        })
      };
    }

    assert.equal(url, "https://vision.googleapis.com/v1/images:annotate");
    assert.equal(options.headers["X-Goog-Api-Key"], "test-key");
    assert.equal(new URL(url).searchParams.has("key"), false);
    return {
      ok: true,
      json: async () => ({
        responses: [{ fullTextAnnotation: { text: "prescription text" } }]
      })
    };
  };

  try {
    const response = await invoke({
      body: {
        captchaToken: "valid-token",
        imageBase64: "aGVsbG8=",
        mimeType: "image/png"
      }
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { text: "prescription text" });
    assert.equal(response.headers["Cache-Control"], "no-store");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
