// src/App.jsx (ULTIMATE VERSION: Confetti + Share + 12 Medicines + Admin Link)
import React, { useState, useRef } from "react";
import "./index.css";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search, Camera, Pill, ShieldCheck, AlertCircle, X, Sparkles, Mic, Share2, Settings } from "lucide-react"; // Added Settings Icon
import { Toaster, toast } from "react-hot-toast"; 
import { motion, AnimatePresence } from "framer-motion"; 
import confetti from "canvas-confetti"; 

// --- CONFIG ---
const VISION_API_KEY = "AIzaSyARj7ZriMUeHruI_KrNHKabi7gaLGGeQNk"; 

const SYMPTOM_MAP = {
  fever: ["paracetamol", "ibuprofen"],
  pain: ["paracetamol", "ibuprofen"],
  acidity: ["pantoprazole"],
  allergy: ["cetirizine"],
  diabetes: ["metformin", "sitagliptin"],
  thyroid: ["levothyroxine"],
  cholesterol: ["atorvastatin", "rosuvastatin"],
  bp: ["telmisartan", "amlodipine"],
  infection: ["amoxicillin"]
};

// 12 Medicines Keyword List
const MEDICINE_KEYWORDS = [
  "paracetamol", "dolo", "calpol", "pantoprazole", "metformin",
  "telmisartan", "atorvastatin", "amoxicillin", "cetirizine",
  "ibuprofen", "amlodipine", "levothyroxine", "sitagliptin", 
  "rosuvastatin", "augmentin", "thyronorm", "januvia"
];

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedMeds, setDetectedMeds] = useState([]);
  const fileInputRef = useRef(null);

  // --- 1. VOICE SEARCH ---
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice search not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    const toastId = toast.loading("Listening... speak now");
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      toast.dismiss(toastId);
      toast.success(`Heard: "${transcript}"`);
      setQuery(transcript);
      handleSearch(transcript); 
    };

    recognition.onerror = (event) => {
      toast.dismiss(toastId);
      console.error("Voice error:", event.error);
      toast.error("Could not hear you. Try again.");
    };
  };

  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term) {
      toast.error("Please enter a medicine name");
      return;
    }
    
    setLoading(true);
    setResults([]); 
    const toastId = toast.loading("Searching database...");

    try {
      const qLower = term.toLowerCase().trim();
      const snapshot = await getDocs(collection(db, "medicine_data"));
      let matches = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const salt = data.salt.toLowerCase();
        const brandNames = data.alternatives.map((a) => a.brand.toLowerCase());

        if (
          salt.includes(qLower) ||
          brandNames.some((b) => b.includes(qLower)) ||
          (SYMPTOM_MAP[qLower] && SYMPTOM_MAP[qLower].some((s) => salt.includes(s)))
        ) {
          matches.push(data);
        }
      });
      
      setResults(matches);
      
      if (matches.length > 0) {
        toast.success(`Found ${matches.length} matches!`, { id: toastId });
        
        // 🎉 CHECK FOR HUGE SAVINGS & TRIGGER CONFETTI
        let hugeSavingsFound = false;
        matches.forEach(group => {
           const prices = group.alternatives.map(a => a.price);
           const maxPrice = Math.max(...prices);
           const minPrice = Math.min(...prices);
           if ((maxPrice - minPrice) / maxPrice > 0.5) hugeSavingsFound = true;
        });

        if (hugeSavingsFound) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#22c55e', '#0f766e', '#fbbf24']
            });
            toast("Massive savings detected!", { icon: '🤑' });
          }, 500);
        }

      } else {
        toast.error("No medicines found.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const toastId = toast.loading("Scanning prescription...");
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Image = reader.result.split(",")[1];
        
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [{
                image: { content: base64Image },
                features: [{ type: "TEXT_DETECTION" }]
              }]
            })
          }
        );

        const data = await response.json();
        const text = data.responses?.[0]?.fullTextAnnotation?.text || "";
        const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
        const found = MEDICINE_KEYWORDS.filter(k => 
          cleaned.split(" ").some(word => word.includes(k) || k.includes(word))
        );

        if (found.length > 0) {
          setDetectedMeds(found);
          setQuery(found[0]);
          handleSearch(found[0]);
          toast.success("Medicine detected!", { id: toastId });
        } else {
          toast.error("Could not read medicine name.", { id: toastId });
        }
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      toast.error("Scan failed.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      <header className="header">
        <div className="blob"></div>
        <div className="header-content">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              FairDose
            </motion.h1>
            <p className="subtitle">Compare prices & find generic alternatives</p>
          </div>
          <div className="badge-group">
            <span className="badge trust"><ShieldCheck size={14} /> CDSCO Appr.</span>
          </div>
        </div>
      </header>

      <div className="search-container">
        <motion.div 
          className="search-box"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="text-gray-400" size={24} />
          <input
            type="text"
            className="search-input"
            placeholder="Search medicine (e.g. Dolo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          {query && (
            <button className="icon-btn" onClick={() => setQuery("")}>
              <X size={18} />
            </button>
          )}

          <div className="divider"></div>
          <button className="icon-btn" onClick={startVoiceSearch} title="Voice Search">
            <Mic size={20} />
          </button>
          <button className="btn-icon" onClick={() => fileInputRef.current.click()}>
            <Camera size={20} />
          </button>
          <button className="btn-primary" onClick={() => handleSearch()}>
            Search
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
        </motion.div>

        <AnimatePresence>
          {detectedMeds.length > 0 && (
            <motion.div 
              className="tags-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="tag-label"><Sparkles size={12} /> Detected:</span>
              {detectedMeds.map((med, idx) => (
                <motion.span 
                  key={idx} 
                  whileHover={{ scale: 1.05 }}
                  className="tag-pill" 
                  onClick={() => { setQuery(med); handleSearch(med); }}
                >
                  {med}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="results-grid">
        {loading ? (
          [1, 2, 3].map((n) => (
            <motion.div key={n} className="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          ))
        ) : results.length > 0 ? (
          results.map((medGroup, idx) => (
            <MedicineGroup key={idx} data={medGroup} index={idx} />
          ))
        ) : (
          !loading && (
            <div style={{ gridColumn: '1/-1' }}>
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '20px', textAlign: 'center' }}
              >
                <Pill size={48} className="empty-icon" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Know Your Medicine</h3>
                <p style={{ margin: 0, color: '#64748b' }}>Tap a category to find the right medicine.</p>
              </motion.div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                gap: '12px', 
                marginTop: '20px' 
              }}>
                <SaltCard symptom="Antibiotic" salt="Amoxicillin" color="purple" onClick={() => handleSearch("Amoxicillin")} />
                <SaltCard symptom="Hypertension" salt="Telmisartan" color="red" onClick={() => handleSearch("Telmisartan")} />
                <SaltCard symptom="Cholesterol" salt="Atorvastatin" color="indigo" onClick={() => handleSearch("Atorvastatin")} />
                <SaltCard symptom="Diabetes" salt="Metformin" color="teal" onClick={() => handleSearch("Metformin")} />
                <SaltCard symptom="Acidity" salt="Pantoprazole" color="orange" onClick={() => handleSearch("Pantoprazole")} />
                <SaltCard symptom="Thyroid" salt="Levothyroxine" color="pink" onClick={() => handleSearch("Levothyroxine")} />
                <SaltCard symptom="Diabetes (Adv)" salt="Sitagliptin" color="cyan" onClick={() => handleSearch("Sitagliptin")} />
                <SaltCard symptom="Cardiac" salt="Rosuvastatin" color="rose" onClick={() => handleSearch("Rosuvastatin")} />
                <SaltCard symptom="Fever" salt="Paracetamol" color="blue" onClick={() => handleSearch("Paracetamol")} />
                <SaltCard symptom="High BP" salt="Amlodipine" color="amber" onClick={() => handleSearch("Amlodipine")} />
                <SaltCard symptom="Pain Relief" salt="Ibuprofen" color="lime" onClick={() => handleSearch("Ibuprofen")} />
                <SaltCard symptom="Allergy" salt="Cetirizine" color="green" onClick={() => handleSearch("Cetirizine")} />
              </div>
            </div>
          )
        )}
      </main>

      

      {/* 🔹 ADMIN FLOATING BUTTON 🔹 */}
      <motion.a
        href="https://fairdoseadmin.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Admin Login"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#2563eb', // Matches your theme color
          color: 'white',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
          zIndex: 1000,
          cursor: 'pointer'
        }}
      >
        <Settings size={24} />
      </motion.a>
      {/* 🔹 END ADMIN BUTTON 🔹 */}

    </div>
  );
}

// --- SUB-COMPONENT: CARD WITH SHARE & VISUALS ---
function MedicineGroup({ data, index }) {
  const prices = data.alternatives.map(a => a.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // 📤 SHARE FUNCTION
  const handleShare = (alt, savings) => {
    const text = `Found ${alt.brand} for ₹${alt.price} on FairDose! That's ${savings}% cheaper than average.`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", { icon: '📋' });
  };

  return (
    <>
      {data.alternatives.map((alt, i) => {
        const isCheapest = alt.price === minPrice;
        const diffPercent = Math.round(((maxPrice - alt.price) / maxPrice) * 100);
        const barWidth = Math.max(10, Math.round((alt.price / maxPrice) * 100));

        return (
          <motion.div 
            key={i} 
            className={`card ${isCheapest ? "highlight" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + i * 0.05 }} 
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}
          >
            <div className="card-header">
              <div className="card-title-row">
                <h3>{alt.brand}</h3>
                {/* 📤 SHARE BUTTON */}
                <button 
                  onClick={() => handleShare(alt, diffPercent)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  title="Share this deal"
                >
                  <Share2 size={16} />
                </button>
              </div>
              <p className="card-mfg">{alt.mfg}</p>
            </div>

            <div className="card-footer">
              <div style={{ margin: '12px 0', fontSize: '11px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Price Level</span>
                  <span>{Math.round((alt.price / maxPrice) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ 
                      height: '100%', 
                      background: isCheapest ? '#22c55e' : '#f59e0b',
                      borderRadius: '4px' 
                    }}
                  />
                </div>
              </div>

              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                <div>
                  {alt.type === "Govt Generic" && (
                    <span className="badge govt" style={{marginBottom:'4px', display:'inline-block'}}>Jan Aushadhi</span>
                  )}
                  <div className="price-row" style={{marginTop:0}}>
                    <span className="price-tag">₹{alt.price}</span>
                  </div>
                </div>
                
                {isCheapest && diffPercent > 0 && (
                   <span className="savings-badge">Save {diffPercent}%</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

function SaltCard({ symptom, salt, color, onClick }) {
  const colors = {
    blue:   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    orange: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    green:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    red:    { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    teal:   { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    pink:   { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
    indigo: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
    cyan:   { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
    amber:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    lime:   { bg: '#f7fee7', text: '#4d7c0f', border: '#d9f99d' },
    rose:   { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  };
  const theme = colors[color] || colors.blue;
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px', 
        padding: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '80px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
        {symptom}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
          {salt}
        </span>
        <div style={{ background: 'white', borderRadius: '50%', padding: '4px' }}>
            <Search size={14} color={theme.text} />
        </div>
      </div>
    </motion.div>
  );
}