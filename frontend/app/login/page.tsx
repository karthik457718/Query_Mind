"use client";

import { useState, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestOtp, verifyOtp } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import Magnetic from "@/components/Magnetic";
import InteractiveCanvas from "@/components/InteractiveCanvas";
import "@/app/marketing.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  async function handleRequestOtp() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestOtp(email);
      setStep("code");
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(fullCode?: string) {
    const codeToVerify = fullCode || digits.join("");
    if (codeToVerify.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(email, codeToVerify);
      saveToken(data.access_token);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  function handleDigitChange(idx: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const newDigits = [...digits];
      newDigits[idx] = "";
      setDigits(newDigits);
      return;
    }
    const char = clean[clean.length - 1];
    const newDigits = [...digits];
    newDigits[idx] = char;
    setDigits(newDigits);

    if (idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    } else {
      const full = newDigits.join("");
      if (full.length === 6) {
        handleVerifyOtp(full);
      }
    }
  }

  function handleDigitKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleDigitPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split("");
      setDigits(arr);
      inputRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  }

  const isCodeComplete = digits.join("").length === 6;

  return (
    <main className="gesso-auth-page" style={{ perspective: "1000px" }}>
      <InteractiveCanvas />

      <Link href="/" className="gesso-auth-header">
        <span className="gesso-auth-brand-mark">Q</span>
        <span>QueryMind</span>
      </Link>

      <div
        className={`gesso-auth-card ${shake ? "shake" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 ? "transform 400ms ease" : "transform 80ms ease-out",
        }}
      >
        <div>
          <h1 className="gesso-auth-title">
            {step === "email" ? "Sign in to QueryMind" : "Check your inbox"}
          </h1>
          <p className="gesso-auth-subtitle">
            {step === "email"
              ? "Enter your email to receive a 6-digit one-time passcode."
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="gesso-auth-steps">
          <div
            className={`gesso-auth-step-pill ${
              step === "email" ? "active" : "inactive"
            }`}
          />
          <div
            className={`gesso-auth-step-pill ${
              step === "code" ? "active" : "inactive"
            }`}
          />
        </div>

        {step === "email" ? (
          <form
            className="gesso-auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleRequestOtp();
            }}
          >
            <label className="gesso-auth-label">
              <span>Work or personal email</span>
              <input
                type="email"
                placeholder="name@company.com"
                required
                autoFocus
                className="gesso-auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <Magnetic strength={24}>
              <button
                type="submit"
                disabled={loading || !email}
                className="gesso-auth-btn-primary"
              >
                {loading ? (
                  <>
                    <span className="gesso-spinner" />
                    Sending Code...
                  </>
                ) : (
                  "Continue with OTP →"
                )}
              </button>
            </Magnetic>
          </form>
        ) : (
          <form
            className="gesso-auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }}
          >
            <label className="gesso-auth-label">
              <span>Enter 6-digit passcode</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={handleDigitPaste}
                    className="gesso-auth-input code-digit-box"
                  />
                ))}
              </div>
            </label>

            <Magnetic strength={24}>
              <button
                type="submit"
                disabled={loading || !isCodeComplete}
                className="gesso-auth-btn-primary"
              >
                {loading ? (
                  <>
                    <span className="gesso-spinner" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </button>
            </Magnetic>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setDigits(["", "", "", "", "", ""]);
                setError("");
              }}
              className="gesso-auth-btn-back"
            >
              ← Use a different email address
            </button>
          </form>
        )}

        {copiedSuccess && (
          <div className="gesso-auth-success-hint">
            ✓ Passcode sent! Check your email.
          </div>
        )}

        {error && <div className="gesso-auth-error">{error}</div>}
      </div>
    </main>
  );
}
