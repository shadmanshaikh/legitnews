"use client";

import { useState } from "react";
import { verifyLink } from "../lib/actions";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "LEGIT" | "FAKE" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    if (!url) {
      setStatus("ERROR");
      setMessage("Please enter a valid link address.");
      return;
    }

    setStatus("LOADING");
    setMessage("");

    try {
      const result = await verifyLink(url);

      if (result.status === "LEGIT") {
        setStatus("LEGIT");
        setMessage(result.message || "Verified as legitimate.");
      } else if (result.status === "FAKE") {
        setStatus("FAKE");
        setMessage(result.message || "Warning: This source is not verified as official.");
      } else {
        setStatus("ERROR");
        setMessage(result.message || "Something went wrong.");
      }
    } catch (e) {
      setStatus("ERROR");
      setMessage("Verification failed.");
    }
  };

  return (
    <main>
      <div className="brand-container">
        <div className="title">VERIFY.UAE</div>
        <div className="subtitle">OFFICIAL SOURCE VERIFICATION</div>
      </div>

      <div className="card">
        <div className="input-container">
          <input
            type="text"
            className="url-input"
            placeholder="PASTE LINK HERE (URL, INSTAGRAM POST, REEL)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <button className="verify-button" onClick={handleVerify} disabled={status === "LOADING"}>
            {status === "LOADING" ? "VERIFYING..." : "VERIFY NOW"}
          </button>
        </div>
      </div>

      <div className="result">
        {status === "LOADING" && <div className="loader" />}

        {status === "LEGIT" && (
          <>
            <div className="result-status legit">LEGIT</div>
            <p className="message">{message}</p>
          </>
        )}

        {status === "FAKE" && (
          <>
            <div className="result-status fake">POTENTIAL FAKE</div>
            <p className="message">{message}</p>
          </>
        )}

        {(status === "ERROR" || (!["LEGIT", "FAKE", "LOADING", "IDLE"].includes(status))) && message && (
          <p className="message" style={{ color: "red" }}>{message}</p>
        )}
      </div>

      <footer>
        OFFICIAL VERIFICATION BY MATCHING UAE GOVERNMENT DOMAINS & WORLD NEWS WHITELIST (INCL. INSTAGRAM OFFICIALS)
      </footer>
    </main>
  );
}
