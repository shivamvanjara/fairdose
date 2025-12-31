// ===== OCR.JS (FINAL WORKING VERSION) =====

// Get elements
const scanBtn = document.getElementById("scanBtn");
const imageInput = document.getElementById("imageInput");

// 👉 PASTE YOUR API KEY HERE (keep your own key)
const VISION_API_KEY = "AIzaSyARj7ZriMUeHruI_KrNHKabi7gaLGGeQNk";

// Debug check
console.log("OCR JS LOADED");

// Click scan button → open file picker
scanBtn.addEventListener("click", () => {
  console.log("Scan button clicked");
  imageInput.click();
});

// When image is selected
imageInput.addEventListener("change", async () => {
  alert("Image selected");
  console.log("Image selected");

  const file = imageInput.files[0];
  if (!file) {
    alert("No file found");
    return;
  }

  console.log("File:", file.name, file.type, file.size);

  const base64 = await toBase64(file);
  console.log("Base64 ready, length:", base64.length);

  extractText(base64);
});

// Convert image → base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Call Google Vision API
async function extractText(base64Image) {
  console.log("Sending image to Vision API");

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "TEXT_DETECTION" }]
          }
        ]
      })
    }
  );

  console.log("Vision API status:", response.status);

  const data = await response.json();
  console.log("Vision API data:", data);

  const text =
    data.responses?.[0]?.fullTextAnnotation?.text || "";

  console.log("Extracted text:", text);

  autoSearchFromOCR(text);
}

// Auto‑search detected medicine
function autoSearchFromOCR(text) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");

  console.log("OCR CLEANED TEXT:", cleaned);

  const keywords = [
    "paracetamol",
    "dolo",
    "calpol",
    "pantoprazole",
    "metformin",
    "telmisartan",
    "atorvastatin",
    "amoxicillin",
    "cetirizine",
    "ibuprofen",
    "amlodipine"
  ];

  // 🔥 Find ALL matches
  const foundMedicines = keywords.filter(k =>
    cleaned.split(" ").some(word => word.includes(k) || k.includes(word))
  );

  if (foundMedicines.length === 0) {
    alert("No medicine matched. Please search manually.");
    return;
  }

  console.log("Medicines detected:", foundMedicines);

  // Show detected medicines to user
  alert(
    "Detected medicines:\n" +
      foundMedicines.map(m => "• " + m).join("\n")
  );

  // 🔍 Search first medicine automatically
  document.getElementById("searchInput").value = foundMedicines[0];
  document.getElementById("searchBtn").click();
}
const box = document.getElementById("detectedMedicines");
box.innerHTML = foundMedicines
  .map(m => `<span>${m}</span>`)
  .join("");
