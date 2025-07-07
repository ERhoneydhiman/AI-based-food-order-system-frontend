import React, { useEffect, useRef, useState } from "react";

function Home() {
  const [billItems, setBillItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  // 🎤 Start and process voice
  const handleStart = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let resultText = "";

    recognition.onresult = (event) => {
      resultText = event.results[0][0].transcript;
      setTranscript(resultText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = async () => {
      setListening(false);
      if (resultText.trim()) {
        setLoading(true);
        await getBill(resultText);
        setLoading(false);
      } else {
        alert("No voice detected.");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  // 🧾 Get all menu items
  const getMenuItems = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/user/get-all-items"
      );
      const data = await response.json();
      setList(data.data || []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    }
  };

  // 🧾 Send order to backend
  const getBill = async (orderText) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/user/give-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userOrder: orderText }),
        }
      );

      const data = await response.json();
      setBillItems(data);
      setShowPopup(true);
      console.log("Bill response:", data);
    } catch (error) {
      console.error("Error generating bill:", error);
      alert("Failed to generate bill. Please try again.");
    }
  };

  useEffect(() => {
    getMenuItems();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>📋 Menu Items</h1>

      <ul>
        {list.map((item) => (
          <li key={item.id}>
            <strong>{item.itemName}</strong> — ₹{item.itemPrice} —{" "}
            {item.status ? "✅ Available" : "❌ Not Available"}
          </li>
        ))}
      </ul>

      <hr />

      <div style={{ marginTop: "30px" }}>
        <h2>🎤 Voice Order</h2>
        <p>Status: {listening ? "🎙️ Listening..." : "🟢 Idle"}</p>

        <button onClick={handleStart} disabled={listening || loading}>
          ▶️ Start
        </button>
        <button
          onClick={() => setTranscript("")}
          disabled={listening || loading}
          style={{ marginLeft: "10px" }}
        >
          🧹 Reset
        </button>

        <div
          style={{
            background: "#f0f0f0",
            marginTop: "15px",
            padding: "10px",
            borderRadius: "5px",
            minHeight: "80px",
          }}
        >
          {transcript || "🎤 Speak your order..."}
        </div>

        {loading && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div className="loader"></div>
            <p>⏳ Generating bill, please wait...</p>
          </div>
        )}
      </div>

      {/* Popup for Bill */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupBox}>
            <h2>🧾 Your Bill</h2>
            {billItems.length > 0 ? (
              <>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {billItems.map((item, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      <strong>{item.itemName}</strong> — ₹{item.itemPrice} ×{" "}
                      {item.itemQuantity} = ₹{item.totalItemPrice}
                    </li>
                  ))}
                </ul>
                <hr />
                <h3 style={{ textAlign: "right" }}>
                  Total: ₹
                  {billItems.reduce(
                    (sum, item) => sum + item.totalItemPrice,
                    0
                  )}
                </h3>
              </>
            ) : (
              <p>No items in the bill.</p>
            )}
            <button onClick={() => setShowPopup(false)} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loader CSS */}
      <style>{`
        .loader {
          border: 5px solid #f3f3f3;
          border-top: 5px solid maroon;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Popup styles
const styles = {
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  popupBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "8px 16px",
    backgroundColor: "maroon",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Home;
