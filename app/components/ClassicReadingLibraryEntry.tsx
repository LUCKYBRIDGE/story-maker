"use client";

import { useEffect } from "react";

const CLASSIC_READING_CARD = "rabbit-classic-reading";

function classicReadingUrl() {
  const root = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  return `${root}classic/rabbit/`;
}

function createClassicReadingCard() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "focus-action-card";
  button.dataset.classicReadingCard = CLASSIC_READING_CARD;
  button.setAttribute("aria-label", "토끼전 원작 읽기");
  button.innerHTML = `
    <div class="action-card-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22V5.5Z"></path>
        <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22V5.5Z"></path>
      </svg>
    </div>
    <div class="action-card-text">
      <strong class="action-card-title">원작 읽기</strong>
      <small class="action-card-sub">고전 「토끼전」의 대표 이야기를 읽어요</small>
    </div>
  `;
  button.addEventListener("click", () => {
    window.location.assign(classicReadingUrl());
  });
  return button;
}

function removeClassicReadingCards(except?: HTMLElement | null) {
  document
    .querySelectorAll<HTMLElement>(`[data-classic-reading-card="${CLASSIC_READING_CARD}"]`)
    .forEach((card) => {
      if (!except || card !== except) card.remove();
    });
}

export function ClassicReadingLibraryEntry() {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const stage = document.querySelector<HTMLElement>(".library-focus-stage");
        const title = stage
          ?.querySelector<HTMLElement>(".focus-meta-title")
          ?.textContent?.trim();
        const grid = stage?.querySelector<HTMLElement>(".focus-action-grid") ?? null;
        const availability = stage?.querySelector<HTMLElement>(".focus-availability");
        const rabbitSelected = title === "토끼와 자라";

        if (availability) {
          availability.textContent = rabbitSelected
            ? "원작 읽기 · 이용 가능"
            : "원작 읽기 · 준비 중";
        }

        if (!rabbitSelected || !grid) {
          removeClassicReadingCards();
          return;
        }

        let card = grid.querySelector<HTMLElement>(
          `[data-classic-reading-card="${CLASSIC_READING_CARD}"]`,
        );
        if (!card) {
          card = createClassicReadingCard();
          grid.prepend(card);
        }
        removeClassicReadingCards(card);
      });
    };

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeClassicReadingCards();
    };
  }, []);

  return null;
}
