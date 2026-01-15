import React, { useEffect, useMemo } from "react";

type Props = {
  onClose: () => void;
  onExportPdf?: () => void;
};

export function DocumentationOverlay({ onClose, onExportPdf }: Props) {
  // Use Vite BASE_URL so this works both locally (/) and on sub-path deploys (/vmx/, /app/, etc.)
  const docsPath = useMemo(() => {
    const base = (import.meta as any).env?.BASE_URL || "/";
    return base.endsWith("/") ? `${base}docs.html` : `${base}/docs.html`;
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock background scroll while overlay is open
  useEffect(() => {
    const body = document.body;

    // Preserve existing inline styles (so we don't clobber other logic)
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // If the page already has a vertical scrollbar, removing scroll can cause a "layout shift".
    // This compensates by adding padding-right equal to scrollbar width.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  const openDocs = () => {
    const url = new URL(docsPath, window.location.origin).toString();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="docOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="VMX Documentation"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="docOverlayPanel">
        <div className="docOverlayTopbar">
          <div className="docOverlayTitle">
            <div style={{ fontWeight: 900 }}>Documentation</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Guide to using VMX, guardrails, soft costs, escalation and exports
            </div>
          </div>

          <div className="docOverlayBtns">
            <button type="button" className="secondaryBtn" onClick={openDocs}>
              Open in Browser
            </button>

            {onExportPdf ? (
              <button
                type="button"
                className="secondaryBtn"
                onClick={() => {
                  onExportPdf();
                }}
              >
                Export PDF Report
              </button>
            ) : null}

            <button type="button" className="docsBtn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="docOverlayBody">
          <iframe
            title="VMX Documentation"
            src={docsPath}
            style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
          />
        </div>
      </div>
    </div>
  );
}
