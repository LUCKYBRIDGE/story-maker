"use client";

import { useState, useMemo, useId } from "react";
import { ModalDialog } from "./ModalDialog";
import { generateQrSvgData } from "../story-qr-code";

export interface SiteQrModalProps {
  open: boolean;
  onClose: () => void;
  overrideUrl?: string;
}

export function SiteQrModal({ open, onClose, overrideUrl }: SiteQrModalProps) {
  const [copied, setCopied] = useState(false);
  const titleId = useId();

  const currentUrl = useMemo(() => {
    if (overrideUrl) return overrideUrl;
    if (typeof window !== "undefined" && window.location) {
      return window.location.origin + window.location.pathname;
    }
    return "https://story-maker.pages.dev";
  }, [overrideUrl]);

  const qrData = useMemo(() => {
    if (!open || !currentUrl) return null;
    try {
      return generateQrSvgData(currentUrl);
    } catch {
      return null;
    }
  }, [open, currentUrl]);

  if (!open) return null;

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <ModalDialog
      overlayClassName="nolstory-studio-backdrop is-open qr-modal-backdrop"
      dialogClassName="nolstory-studio-modal qr-modal-dialog"
      label="교실 접속 QR 코드"
      onClose={onClose}
    >
      <div className="qr-modal-content">
        <button
          type="button"
          className="btn-modal-close"
          onClick={onClose}
          aria-label="QR 코드 닫기"
        >
          ✕
        </button>

        <header className="qr-modal-header">
          <span className="qr-modal-badge">교실 수업용</span>
          <h2 id={titleId} className="qr-modal-title">교실 화면 바로 접속</h2>
          <p className="qr-modal-desc">
            학생 기기(스마트폰·태블릿)의 카메라로 비추면<br />
            선생님과 같은 화면으로 즉시 들어올 수 있어요.
          </p>
        </header>

        <div className="qr-code-showcase">
          <div className="qr-code-frame">
            {qrData ? (
              <svg
                viewBox={qrData.viewBox}
                className="qr-code-svg"
                role="img"
                aria-label={`접속 주소 QR 코드: ${currentUrl}`}
              >
                <rect width="100%" height="100%" fill="#ffffff" rx="1" />
                <path d={qrData.path} fill="#1a140e" />
              </svg>
            ) : (
              <div className="qr-code-loading">QR 코드를 만드는 중...</div>
            )}
          </div>

          <div className="qr-url-box">
            <span className="qr-url-text" title={currentUrl}>{currentUrl}</span>
            <button
              type="button"
              className={`qr-copy-btn ${copied ? "is-copied" : ""}`}
              onClick={handleCopy}
              aria-label="주소 복사"
            >
              {copied ? "✓ 복사됨" : "주소 복사"}
            </button>
          </div>
        </div>

        <div className="qr-modal-tip">
          <span className="qr-tip-icon" aria-hidden="true">💡</span>
          <p className="qr-tip-text">
            <strong>선생님을 위한 팁:</strong> 빔프로젝터나 전자칠판에 이 창을 띄워두면 학생들이 자리에서 쉽게 참여해요.
          </p>
        </div>

        <footer className="qr-modal-footer">
          <button
            type="button"
            className="qr-modal-confirm-btn"
            onClick={onClose}
          >
            확인
          </button>
        </footer>
      </div>
    </ModalDialog>
  );
}
