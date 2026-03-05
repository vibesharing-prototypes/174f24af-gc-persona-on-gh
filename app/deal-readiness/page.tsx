"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

const DILIGENT_RED = "#EE312E";
const DILIGENT_DARK = "#AF292E";
const DILIGENT_MID = "#D3222A";

function DiligentLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fill={DILIGENT_RED} d="M200.87,110.85c0,33.96-12.19,61.94-33.03,81.28c-0.24,0.21-0.42,0.43-0.66,0.64c-15.5,14.13-35.71,23.52-59.24,27.11l-1.59-1.62l35.07-201.75l1.32-3.69C178.64,30.36,200.87,65.37,200.87,110.85z" />
        <path fill={DILIGENT_DARK} d="M142.75,12.83l-0.99,1.47L0.74,119.34L0,118.65c0,0,0-0.03,0-0.06V0.45h85.63c5.91,0,11.64,0.34,17.19,1.01h0.21c14.02,1.66,26.93,5.31,38.48,10.78C141.97,12.46,142.75,12.83,142.75,12.83z" />
        <path fill={DILIGENT_MID} d="M142.75,12.83L0,118.65v99.27v3.62h85.96c7.61,0,14.94-0.58,21.99-1.66C107.95,219.89,142.75,12.83,142.75,12.83z" />
      </g>
    </svg>
  );
}

type Phase = 1 | 2 | 3;

export default function DealReadinessPage() {
  const [phase, setPhase] = useState<Phase>(1);
  const [scanDone, setScanDone] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<Record<number, "queued" | "scanning" | "done">>({
    1: "scanning", 2: "queued", 3: "queued", 4: "queued", 5: "queued", 6: "queued",
  });
  const [documentDiscrepancyOpen, setDocumentDiscrepancyOpen] = useState(false);
  const [assessmentPanelCollapsed, setAssessmentPanelCollapsed] = useState(false);

  const showPhase = (n: Phase) => setPhase(n);

  const PROTO_STEPS = [
    "1. Cold Start",
    "2. Readiness",
    "3. Close",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const setStep = (window as unknown as { ProtoPanel?: { setStep: (n: number) => void } }).ProtoPanel?.setStep;
    if (setStep) setStep(phase);
  }, [phase]);

  useEffect(() => {
    return () => {
      document.getElementById("pp-bar")?.remove();
      document.getElementById("pp-styles")?.remove();
      document.body.classList.remove("pp-open");
    };
  }, []);

  const runScan = () => {
    if (scanDone) return;
    setScanDone(true);
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(p + 2, 100);
      setScanProgress(p);
      if (p >= 15) setAgentStates((s) => ({ ...s, 1: "done", 2: p >= 15 ? "scanning" : s[2] }));
      if (p >= 30) setAgentStates((s) => ({ ...s, 2: "done", 3: "scanning" }));
      if (p >= 45) setAgentStates((s) => ({ ...s, 3: "done", 4: "scanning" }));
      if (p >= 60) setAgentStates((s) => ({ ...s, 4: "done", 5: "scanning" }));
      if (p >= 80) setAgentStates((s) => ({ ...s, 5: "done", 6: "scanning" }));
      if (p >= 95) setAgentStates((s) => ({ ...s, 6: "done" }));
      if (p === 100) clearInterval(iv);
    }, 40);
  };

  // When landing on Readiness (phase 2), start progress if not already done
  useEffect(() => {
    if (phase !== 2 || scanDone) return;
    runScan();
  }, [phase, scanDone]);

  const agents = [
    { id: 1, icon: "⚖️", name: "Entity Compliance Agent", source: "Diligent Entities · 15 entities, 6 jurisdictions", bg: "#1a1540" },
    { id: 2, icon: "📋", name: "Corporate Records Agent", source: "Diligent Boards · 47 board actions", bg: "#0d2040" },
    { id: 3, icon: "💰", name: "Financial Health Agent", source: "NetSuite · GL sync", bg: "#0d3a20" },
    { id: 4, icon: "📊", name: "Cap Table Agent", source: "Carta · last sync: Feb 20", bg: "#1a1540" },
    { id: 5, icon: "🔐", name: "IP & Contracts Agent", source: "SharePoint · 312 documents", bg: "#3a200d" },
    { id: 6, icon: "🏛️", name: "Regulatory & Tax Agent", source: "Diligent Compliance", bg: "#0d2a2a" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--em-bg)", color: "var(--em-text)" }}>
      <Script
        src="/proto-panel.js"
        strategy="afterInteractive"
        onLoad={() => {
          const win = window as unknown as {
            ProtoPanel?: {
              init: (cfg: {
                description: string;
                steps: string[];
                stateToggle: boolean;
                onStepChange: (step: number) => void;
              }) => void;
            };
          };
          if (win.ProtoPanel) {
            win.ProtoPanel.init({
              description: "Deal Readiness — assess transaction readiness, run remediation, and orchestrate closing.",
              steps: PROTO_STEPS,
              stateToggle: false,
              onStepChange: (step) => setPhase(step as Phase),
            });
          }
        }}
      />
      {/* Chrome */}
      <div className="w-full border-b px-4 py-3" style={{ borderColor: "var(--em-border)", background: "var(--em-bg2)" }}>
        <div className="mx-auto flex max-w-5xl items-center">
          <div className="flex items-center gap-3">
            <DiligentLogo className="h-6 w-auto" />
            <span className="text-sm font-semibold">Exit Machine — Diligent One</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Phase 1: Cold Start — Continuous monitoring alert */}
        {phase === 1 && (
          <>
            <div className="mb-7">
              <h1 className="mb-1.5 text-[26px] font-bold">Exit Readiness Update</h1>
              <p className="text-sm" style={{ color: "var(--em-text2)" }}>
                Diligent One has been monitoring your transaction readiness. Here&apos;s your update.
              </p>
            </div>

            {/* Alert card — matches screenshot: continuous monitoring, KPI, single CTA */}
            <div
              className="mb-6 overflow-hidden rounded-xl border"
              style={{
                background: "var(--em-alert-bg)",
                borderColor: "var(--em-purple)",
              }}
            >
              <div className="flex items-start gap-3.5 px-7 pt-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--em-purple2)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" style={{ color: "var(--em-purple)" }} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--em-alert-text-dim)" }}>DILIGENT ONE</span>
                    <span className="text-[11px]" style={{ color: "var(--em-alert-text-dim)" }}>Just now</span>
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--em-alert-text)" }}>Meridian Labs — Exit Readiness Update</h2>
                </div>
              </div>
              <div className="mx-7 border-t" style={{ borderColor: "var(--em-border)" }} />
              <div className="px-7 py-5">
                <p className="mb-4 text-[13.5px] leading-relaxed" style={{ color: "var(--em-alert-text-muted)" }}>
                  Your board passed <strong style={{ color: "var(--em-alert-text)" }}>Resolution #2026-003</strong>, authorizing exploration of strategic alternatives. Diligent One has been monitoring your <strong style={{ color: "var(--em-alert-text)" }}>transaction readiness continuously</strong> — your <strong style={{ color: "var(--em-alert-text)" }}>prioritized to-do list is ready now</strong>.
                </p>
                <div
                  className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border p-3.5"
                  style={{ background: "var(--em-alert-inner-bg)", borderColor: "var(--em-border2)" }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-lg font-bold text-white"
                    style={{ background: "var(--em-purple)" }}
                  >
                    55%
                  </span>
                  <p className="text-[12.5px] leading-snug" style={{ color: "var(--em-alert-text-muted)" }}>
                    Median Series C readiness at board authorization. Based on your governance data, you&apos;re tracking above this benchmark.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg px-6 py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-95"
                  style={{ background: "var(--em-purple)" }}
                  onClick={() => setPhase(2)}
                >
                  View Your Readiness To-Do List →
                </button>
                <p className="mt-3 text-center text-[11px]" style={{ color: "var(--em-alert-text-dim)" }}>
                  Ready in seconds • No setup required
                </p>
              </div>
            </div>
          </>
        )}

        {/* Phase 2: Readiness — Scorecard on load + progress bar with flashing agent names */}
        {phase === 2 && (
          <>
            <div className="mb-7">
              <h1 className="mb-1.5 text-[26px] font-bold">Here&apos;s where Meridian Labs stands, Elena.</h1>
              <p className="text-sm" style={{ color: "var(--em-text2)" }}>You&apos;re 13 points above the Series C median. Three critical issues need your attention before you can go to market.</p>
            </div>

            {/* Progress bar — above scorecard; checklist + collapsible when complete */}
            <div className="mb-6 overflow-hidden rounded-lg border" style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}>
              {(() => {
                const assessmentSteps = [
                  "Gathering governance data",
                  "Connecting to Data Room",
                  "Scanning entity records",
                  "Processing board actions",
                  "Running discrepancy checks",
                  "Finalizing scorecard",
                ];
                const stepCount = assessmentSteps.length;
                const completedCount = scanProgress >= 100 ? stepCount : Math.floor((scanProgress / 100) * stepCount);
                const inProgressIndex = scanProgress >= 100 ? -1 : completedCount;
                const isComplete = scanProgress >= 100;
                const showCollapsed = isComplete && assessmentPanelCollapsed;

                return (
                  <>
                    {/* Header: when complete, clickable to collapse/expand */}
                    {isComplete ? (
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                        onClick={() => setAssessmentPanelCollapsed(!assessmentPanelCollapsed)}
                        style={{ background: "var(--em-bg3)", borderColor: "var(--em-border)", borderBottom: showCollapsed ? "none" : "1px solid var(--em-border)" }}
                      >
                        <span className="text-sm font-semibold" style={{ color: "var(--em-green)" }}>Assessment complete</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]" style={{ color: "var(--em-text3)" }}>{scanProgress}%</span>
                          <span className="text-[12px] transition-transform" style={{ color: "var(--em-text3)", transform: showCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                        </div>
                      </button>
                    ) : (
                      <div className="border-b px-4 py-3" style={{ borderColor: "var(--em-border)" }}>
                        <p className="text-sm font-medium" style={{ color: "var(--em-text)" }}>Running your assessment. It will only take a few moments.</p>
                      </div>
                    )}

                    {!showCollapsed && (
                      <>
                        <div className="px-4 pt-3 pb-2">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {!isComplete ? (
                                <span key={inProgressIndex} className="agent-name-flash" style={{ color: "var(--em-purple)" }}>
                                  {agents[Math.min(5, Math.floor(scanProgress / 17))]?.name ?? agents[0].name}
                                </span>
                              ) : (
                                <span style={{ color: "var(--em-green)" }}>All steps complete</span>
                              )}
                            </span>
                            <span className="text-[11px]" style={{ color: "var(--em-text3)" }}>{Math.min(100, scanProgress)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--em-bg3)" }}>
                            <div
                              className="h-full rounded-full transition-[width] duration-75 ease-linear"
                              style={{ width: `${scanProgress}%`, background: isComplete ? "var(--em-green)" : "var(--em-purple)" }}
                            />
                          </div>
                        </div>

                        {/* Checklist: completed (green ✓), in progress (blue spinner), pending (grey) */}
                        <div className="border-t px-4 py-3 pb-4" style={{ borderColor: "var(--em-border)" }}>
                          <p className="mb-3 text-xs font-medium" style={{ color: "var(--em-text2)" }}>Creating your context packet</p>
                          <ul className="space-y-2">
                            {assessmentSteps.map((label, i) => {
                              const done = i < completedCount;
                              const inProgress = i === inProgressIndex;
                              return (
                                <li key={label} className="flex items-center gap-2.5 text-[13px]">
                                  {done && (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-green-500" style={{ color: "var(--em-green)" }}>✓</span>
                                  )}
                                  {inProgress && (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                      <span
                                        className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent"
                                        style={{ borderColor: "var(--em-blue)", borderTopColor: "transparent" }}
                                      />
                                    </span>
                                  )}
                                  {!done && !inProgress && <span className="h-4 w-4 shrink-0" />}
                                  <span
                                    style={{
                                      color: done ? "var(--em-green)" : inProgress ? "var(--em-blue)" : "var(--em-text3)",
                                      fontWeight: inProgress ? 600 : 400,
                                    }}
                                  >
                                    {label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          {isComplete && (
                            <p className="mt-2 text-[11px]" style={{ color: "var(--em-text3)" }}>Scorecard is ready</p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Transaction Readiness Scorecard — donut animates 0→68%, counts appear when complete */}
            <div className="mb-6 overflow-hidden rounded-lg border" style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}>
              <div className="flex items-center gap-5 border-b p-5" style={{ borderColor: "var(--em-border)" }}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full transition-[background] duration-150" style={{ background: `conic-gradient(var(--em-purple) 0% ${(scanProgress / 100) * 68}%,var(--em-bg3) ${(scanProgress / 100) * 68}% 100%)` }}>
                  <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full" style={{ background: "var(--em-bg2)" }}>
                    <span className="text-xl font-extrabold transition-[opacity] duration-150">{Math.round((scanProgress / 100) * 68)}</span>
                    <span className="text-[10px]" style={{ color: "var(--em-text2)" }}>%</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold">Transaction Readiness Scorecard</div>
                  <div className="text-xs" style={{ color: "var(--em-text2)" }}>Meridian Labs · February 25, 2026</div>
                  {scanProgress >= 100 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 scorecard-counts-in">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#3a0d0d", color: "var(--em-red)", border: "1px solid #5a1515" }}>🔴 3 Critical</span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#3a200d", color: "var(--em-orange)", border: "1px solid #5a3015" }}>⚠️ 14 Attention</span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#0d3a20", color: "var(--em-green)", border: "1px solid #155a30" }}>✅ 41 Deal-ready</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t p-4" style={{ borderColor: "var(--em-border)" }}>
                {scanProgress >= 100 && (
                  <div className="mb-3 flex items-center gap-3 rounded-lg border p-3 scorecard-counts-in" style={{ background: "var(--em-bg3)", borderColor: "var(--em-border2)" }}>
                    <span className="text-xl">📈</span>
                    <p className="text-[12.5px]" style={{ color: "var(--em-text2)" }}>Median Series C at board authorization: <strong style={{ color: "var(--em-green)" }}>55%</strong>. You&apos;re <strong style={{ color: "var(--em-green)" }}>13 points above average</strong> — that&apos;s 14 months of governance data working for you before the deal started.</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg border px-3 py-2 text-center text-xs font-semibold" style={{ background: "var(--em-bg4)", borderColor: "var(--em-purple)", color: "var(--em-purple)" }}>📊 Overview</button>
                  <button type="button" className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold text-white" style={{ background: "var(--em-purple)" }} onClick={() => setPhase(3)}>Proceed to Close →</button>
                </div>
              </div>
            </div>

            {/* Remediation checklist — loads when assessment complete (same items as Remediation page) */}
            {scanProgress >= 100 && (
              <div className="mb-6 overflow-hidden rounded-lg border scorecard-counts-in" style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}>
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--em-border)" }}>
                  <span className="text-sm font-semibold">Remediation to-do</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--em-border)" }}>
                  <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ background: "var(--em-bg3)", borderColor: "var(--em-border)" }}>
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#3a0d0d", color: "var(--em-red)", border: "1px solid #5a1515" }}>Critical</span>
                    <span className="text-[11px]" style={{ color: "var(--em-text3)" }}>3 tasks · Blocks closing</span>
                  </div>
                  {[
                    { title: "Alpha Tech Texas LLC — Forfeited with Comptroller", tag: "Entity Compliance", est: "30 min" },
                    { title: "Founder IP assignment gap — James Liu", tag: "IP & Contracts", est: "2–4 weeks" },
                    { title: "Missing board resolution — 2023 option pool expansion", tag: "Cap Table & Equity", est: "1–2 weeks" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 px-4 py-2.5" style={{ borderColor: "var(--em-border)" }}>
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border" style={{ borderColor: "var(--em-border2)", background: "var(--em-bg3)" }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium" style={{ color: "var(--em-text)" }}>{item.title}</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: "var(--em-text3)" }}>{item.tag} · Est. {item.est}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 border-t border-b px-4 py-2.5" style={{ background: "var(--em-bg3)", borderColor: "var(--em-border)" }}>
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#3a200d", color: "var(--em-orange)", border: "1px solid #5a3015" }}>High value</span>
                    <span className="text-[11px]" style={{ color: "var(--em-text3)" }}>14 tasks · Before marketing</span>
                  </div>
                  {[
                    { title: "Prepare Adjusted EBITDA bridge with add-back analysis", tag: "Financial" },
                    { title: "Change-of-control clause scan — 312 contracts", tag: "Contracts · $4.7M at risk" },
                    { title: "Document discrepancy — revenue in deck doesn't match spreadsheet", tag: "Discrepancy intelligence · Numbers differ across docs", isDocumentDiscrepancy: true },
                    { title: "Meridian UK Ltd — Annual return preparation", tag: "Entity · Due in 47 days" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      role={item.isDocumentDiscrepancy ? "button" : undefined}
                      tabIndex={item.isDocumentDiscrepancy ? 0 : undefined}
                      onClick={item.isDocumentDiscrepancy ? () => setDocumentDiscrepancyOpen(true) : undefined}
                      onKeyDown={item.isDocumentDiscrepancy ? (e) => e.key === "Enter" && setDocumentDiscrepancyOpen(true) : undefined}
                      className={`flex items-start gap-3 px-4 py-2.5 ${item.isDocumentDiscrepancy ? "cursor-pointer hover:bg-[var(--em-bg3)] transition-colors" : ""}`}
                      style={{ borderColor: "var(--em-border)" }}
                    >
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border" style={{ borderColor: "var(--em-border2)", background: "var(--em-bg3)" }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium" style={{ color: "var(--em-text)" }}>{item.title}</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: "var(--em-text3)" }}>{item.tag}</div>
                      </div>
                      {item.isDocumentDiscrepancy && (
                        <span className="text-[11px]" style={{ color: "var(--em-purple)" }}>Review →</span>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderColor: "var(--em-border)" }}>
                    <span className="text-[12px]" style={{ color: "var(--em-text3)" }}>Standard · 41 tasks before VDR opens</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2.5 border-t pt-4" style={{ borderColor: "var(--em-border)" }}>
              <button type="button" className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--em-border2)", color: "var(--em-text2)", background: "var(--em-bg3)" }}>Export for Board</button>
              <button type="button" className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--em-border2)", color: "var(--em-text2)", background: "var(--em-bg3)" }}>View Trajectory</button>
            </div>
          </>
        )}

        {/* Phase 3: Closing */}
        {phase === 3 && (
          <>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <h1 className="mb-1.5 text-[26px] font-bold">You&apos;re in the final 30 days, Elena.</h1>
                <p className="text-sm" style={{ color: "var(--em-text2)" }}>Meridian Labs × Titan Corp · Target close March 26, 2026. Certificates, consents, funds flow — I&apos;m tracking all of it.</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                style={{ background: "var(--em-purple)" }}
              >
                View in Data Room →
              </button>
            </div>
            {[
              { icon: "📜", iconBg: "#0d3a20", title: "Good Standing Certificates", sub: "6 jurisdictions · Auto-scheduled", tag: "ON TRACK", tagGreen: true, rows: [
                { label: "Delaware (primary)", sub: "Auto-requested · 3–5 business days", pct: 100, status: "✅ Received", statusColor: "var(--em-green)" },
                { label: "Texas (Alpha Tech LLC)", sub: "Post-reinstatement · 5–7 business days", pct: 65, status: "⏳ In progress", statusColor: "var(--em-blue)" },
                { label: "United Kingdom (Meridian UK Ltd)", sub: "Companies House · 10–14 business days", pct: 30, status: "⏳ Requested", statusColor: "var(--em-purple)" },
                { label: "California · New York · Canada", sub: "3 jurisdictions · Staggered by timeline", pct: 10, status: "Scheduled", statusColor: "var(--em-text2)" },
              ]},
              { icon: "📋", iconBg: "#3a200d", title: "Third-Party Consents", sub: "14 contracts · Change-of-control provisions", tag: "2 PENDING", tagOrange: true, rows: [
                { label: "9 consents received", sub: "Executed copies in VDR", status: "✅ 9 / 14", statusColor: "var(--em-green)" },
                { label: "3 in progress", sub: "Reminder emails auto-sent · Expected this week", status: "⏳ 3 / 14", statusColor: "var(--em-blue)" },
                { label: "2 not yet requested — $1.2M revenue", sub: "🧠 HITL: approval needed to initiate contact", status: "Approve Outreach", statusColor: "var(--em-text)", button: true },
              ]},
              { icon: "⚖️", iconBg: "#0d2040", title: "Regulatory Filings", sub: "HSR · CFIUS · State filings", tag: "CLEARED", tagGreen: true, rows: [
                { label: "HSR filing — Not required", sub: "$120M deal value below $133.9M threshold · Saved ~$30K", status: "✅ N/A", statusColor: "var(--em-green)" },
                { label: "CFIUS review — Not required", sub: "No sensitive tech / foreign buyer trigger · Saved ~$40K", status: "✅ N/A", statusColor: "var(--em-green)" },
              ]},
              { icon: "💰", iconBg: "#1a1540", title: "Funds Flow & Cap Table Waterfall", sub: "Carta integration · Merger agreement terms applied", tag: "RECONCILED", tagGreen: true, rows: [
                { label: "Cap table waterfall", sub: "Carta sync · Merger terms applied", status: "✅ Complete", statusColor: "var(--em-green)" },
                { label: "Escrow allocation — $6M (5% of deal value)", sub: "18-month tail · R&W insurance primary", status: "✅ Confirmed", statusColor: "var(--em-green)" },
                { label: "Penny reconciliation", sub: "All payoff letters, wires, and prorations verified", status: "✅ Verified", statusColor: "var(--em-green)" },
              ]},
            ].map((card) => (
              <div key={card.title} className="mb-4 overflow-hidden rounded-lg border" style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}>
                <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--em-border)" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: card.iconBg }}>{card.icon}</div>
                    <div>
                      <div className="text-sm font-semibold">{card.title}</div>
                      <div className="text-xs" style={{ color: "var(--em-text2)" }}>{card.sub}</div>
                    </div>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: card.tagGreen ? "#0d3a20" : "#3a200d", color: card.tagGreen ? "var(--em-green)" : "var(--em-orange)", border: `1px solid ${card.tagGreen ? "var(--em-green)" : "var(--em-orange)"}` }}>{card.tag}</span>
                </div>
                {card.rows.map((r: { label: string; sub?: string; pct?: number; status?: string; statusColor?: string; button?: boolean }) => (
                  <div key={r.label} className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "var(--em-border)" }}>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px]">{r.label}</div>
                      {r.sub && <div className="text-[11px]" style={{ color: "var(--em-text2)" }}>{r.sub}</div>}
                    </div>
                    {r.pct !== undefined && (
                      <div className="h-1.5 w-[120px] overflow-hidden rounded" style={{ background: "var(--em-bg3)" }}>
                        <div className="h-full rounded" style={{ width: `${r.pct}%`, background: r.statusColor || "var(--em-green)" }} />
                      </div>
                    )}
                    <div className="w-[120px] text-right text-xs font-semibold" style={{ color: r.statusColor || "var(--em-text)" }}>
                      {r.button ? <button type="button" className="rounded-lg px-2 py-1 text-[11px] font-semibold text-white" style={{ background: "var(--em-purple)" }}>Approve Outreach</button> : r.status}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="rounded-xl border p-8 text-center" style={{ background: "var(--em-complete-bg)", borderColor: "var(--em-green)" }}>
              <h2 className="text-xl font-extrabold" style={{ color: "var(--em-green)" }}>Transaction Complete</h2>
              <p className="mb-4 text-sm" style={{ color: "var(--em-text2)" }}>Meridian Labs × Titan Corp · Closed March 26, 2026</p>
              <div className="grid grid-cols-3 gap-2.5 text-left">
                {[
                  { val: "147", label: "Days to close (avg: 240–320)", color: "var(--em-green)" },
                  { val: "58/58", label: "Remediation tasks completed", color: "var(--em-blue)" },
                  { val: "30", label: "HITL decisions — all with full context", color: "var(--em-purple)" },
                  { val: "3", label: "Critical gaps caught proactively", color: "var(--em-teal)" },
                  { val: "6", label: "Good Standing certs auto-procured", color: "var(--em-green)" },
                  { val: "1,247", label: "Audit trail actions logged", color: "var(--em-blue)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border p-3.5 text-center" style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}>
                    <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[11px]" style={{ color: "var(--em-text2)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-r-lg border-l-4 p-3 text-left text-xs" style={{ background: "var(--em-complete-box-bg)", borderColor: "var(--em-green)", color: "var(--em-complete-box-text)" }}>
                <strong style={{ color: "var(--em-green)" }}>Elena made 30 decisions over 147 days. The orchestrator handled everything between them.</strong><br /><br />Same decisions. Better information. Half the time.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document discrepancy — side-by-side review modal */}
      {documentDiscrepancyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setDocumentDiscrepancyOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-discrepancy-title"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-xl"
            style={{ background: "var(--em-bg2)", borderColor: "var(--em-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--em-border)" }}>
              <div>
                <h2 id="document-discrepancy-title" className="text-base font-bold">Document discrepancy — review side by side</h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--em-text3)" }}>Discrepancy intelligence: revenue in deck doesn&apos;t match spreadsheet</p>
              </div>
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: "var(--em-border2)", color: "var(--em-text2)", background: "var(--em-bg3)" }}
                onClick={() => setDocumentDiscrepancyOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 gap-px" style={{ background: "var(--em-border)" }}>
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ background: "var(--em-bg2)" }}>
                <div className="border-b px-3 py-2" style={{ borderColor: "var(--em-border)", background: "var(--em-bg3)" }}>
                  <span className="text-xs font-semibold" style={{ color: "var(--em-text2)" }}>Investor deck Q4 2025</span>
                  <span className="ml-2 text-[11px]" style={{ color: "var(--em-text3)" }}>Slide 12 · Revenue summary</span>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="rounded-lg border p-4" style={{ background: "var(--em-bg3)", borderColor: "var(--em-border2)" }}>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--em-text3)" }}>Revenue (FY 2025)</div>
                    <div className="mt-1 text-2xl font-bold" style={{ color: "var(--em-red)", background: "rgba(232,85,85,0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>$12.4M</div>
                    <p className="mt-3 text-[12px]" style={{ color: "var(--em-text2)" }}>Source: Board deck · Last updated Feb 2026</p>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ background: "var(--em-bg2)" }}>
                <div className="border-b px-3 py-2" style={{ borderColor: "var(--em-border)", background: "var(--em-bg3)" }}>
                  <span className="text-xs font-semibold" style={{ color: "var(--em-text2)" }}>Revenue model.xlsx</span>
                  <span className="ml-2 text-[11px]" style={{ color: "var(--em-text3)" }}>Summary tab · Cell D24</span>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="rounded-lg border p-4" style={{ background: "var(--em-bg3)", borderColor: "var(--em-border2)" }}>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--em-text3)" }}>Revenue (FY 2025)</div>
                    <div className="mt-1 text-2xl font-bold" style={{ color: "var(--em-red)", background: "rgba(232,85,85,0.15)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>$12.1M</div>
                    <p className="mt-3 text-[12px]" style={{ color: "var(--em-text2)" }}>Source: NetSuite export · Last synced Feb 18</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--em-border)", background: "var(--em-bg3)" }}>
              <p className="mb-3 text-[11px]" style={{ color: "var(--em-text3)" }}>Discrepancy: <strong style={{ color: "var(--em-orange)" }}>$300K</strong> difference. Update one source or document the variance before marketing.</p>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--em-purple)" }}
              >
                Share with colleague to fix →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}