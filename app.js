import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

// Symptom → salt mapping
const symptomMap = {
  fever: ["paracetamol", "ibuprofen"],
  pain: ["paracetamol", "ibuprofen"],
  acidity: ["pantoprazole"],
  allergy: ["cetirizine"],
  diabetes: ["metformin", "sitagliptin"]
};

// 🔍 Search click
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;
  searchMedicines(query);
});

async function searchMedicines(query) {
  resultsDiv.innerHTML = "Searching...";
  const snapshot = await getDocs(collection(db, "medicine_data"));
  let matches = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const salt = data.salt.toLowerCase();
    const brandNames = data.alternatives.map(a =>
      a.brand.toLowerCase()
    );

    if (
      salt.includes(query) ||
      brandNames.some(b => b.includes(query)) ||
      (symptomMap[query] &&
        symptomMap[query].some(s => salt.includes(s)))
    ) {
      matches.push(data);
    }
  });

  renderResults(matches);
}

function renderResults(medicines) {
  resultsDiv.innerHTML = "";

  if (medicines.length === 0) {
    resultsDiv.innerHTML = "<p>No medicines found.</p>";
    return;
  }

  medicines.forEach(med => {
    const prices = med.alternatives.map(a => a.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    med.alternatives.forEach(alt => {
      const isCheapest = alt.price === minPrice;
      const diffPercent = Math.round(
        ((maxPrice - alt.price) / maxPrice) * 100
      );

      const card = document.createElement("div");
      card.className = "card" + (isCheapest ? " cheapest-card" : "");

      card.innerHTML = `
        <h3>${alt.brand}</h3>
        <p>${alt.mfg}</p>
        <div class="price">₹${alt.price}</div>

        ${isCheapest ? `<span class="badge cheapest">Cheapest</span>` : ""}
        ${alt.type === "Govt Generic" ? `<span class="badge govt">Jan Aushadhi</span>` : ""}

        <div class="diff">${diffPercent}% cheaper than highest price</div>
      `;

      resultsDiv.appendChild(card);
    });
  });
}
