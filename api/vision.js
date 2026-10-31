const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4.5mb"
    }
  }
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const allowedOrigins = (process.env.FAIRDOSE_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!req.headers.origin || !allowedOrigins.includes(req.headers.origin)) {
    return res.status(403).json({ error: "Origin not allowed." });
  }

  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return res.status(415).json({ error: "Content-Type must be application/json." });
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "OCR service is not configured." });
  }

  const { captchaToken, imageBase64, mimeType } = req.body || {};
  if (typeof captchaToken !== "string" || captchaToken.length === 0 || captchaToken.length > 2048) {
    return res.status(400).json({ error: "Complete the verification challenge." });
  }

  if (
    typeof imageBase64 !== "string" ||
    imageBase64.length === 0 ||
    !BASE64_PATTERN.test(imageBase64) ||
    !ALLOWED_IMAGE_TYPES.has(mimeType)
  ) {
    return res.status(400).json({ error: "Invalid image." });
  }

  if (imageBase64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
    return res.status(413).json({ error: "Image is too large." });
  }

  if (Buffer.from(imageBase64, "base64").length > MAX_IMAGE_BYTES) {
    return res.status(413).json({ error: "Image is too large." });
  }

  try {
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return res.status(503).json({ error: "Request verification is not configured." });
    }

    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: captchaToken
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!verification.ok) {
      return res.status(502).json({ error: "Request verification is unavailable." });
    }

    const verificationResult = await verification.json();
    const requestHostname = new URL(req.headers.origin).hostname;
    if (
      !verificationResult.success ||
      verificationResult.action !== "prescription_scan" ||
      verificationResult.hostname !== requestHostname
    ) {
      return res.status(403).json({ error: "Request verification failed." });
    }

    const visionResponse = await fetch("https://vision.googleapis.com/v1/images:annotate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey
      },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: "TEXT_DETECTION" }]
        }]
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!visionResponse.ok) {
      return res.status(502).json({ error: "OCR provider request failed." });
    }

    const result = await visionResponse.json();
    if (result.responses?.[0]?.error) {
      return res.status(502).json({ error: "OCR provider could not process the image." });
    }

    return res.status(200).json({
      text: result.responses?.[0]?.fullTextAnnotation?.text || ""
    });
  } catch {
    return res.status(502).json({ error: "OCR request is temporarily unavailable." });
  }
}
