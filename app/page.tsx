"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getDayPart,
  getJourneyState,
  getLocalTimeParts,
} from "../lib/journey";
import {
  destinationById,
  destinations,
  itinerary,
  referenceTimezone,
  tripTimezone,
  type DestinationId,
} from "../lib/trip";

const DEMO_TIME = "2026-09-13T20:15";

const points: Record<DestinationId, [number, number]> = {
  ubud: [470, 235],
  "nusa-lembongan": [690, 395],
  "gili-trawangan": [865, 280],
  uluwatu: [355, 320],
};

function toDate(value: string) {
  return new Date(`${value}:00+08:00`);
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: tripTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function formatTripDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: tripTimezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function Home() {
  const [lang, setLang] = useState<"pl" | "en">("pl");
  const [preview, setPreview] = useState(true);
  const [previewTime, setPreviewTime] = useState(DEMO_TIME);
  const [selected, setSelected] = useState<DestinationId>("ubud");
  const [realNow, setRealNow] = useState(new Date());

  useEffect(() => {
    if (preview) return;

    const id = window.setInterval(() => setRealNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [preview]);

  const now = preview ? toDate(previewTime) : realNow;
  const journey = useMemo(() => getJourneyState(now), [now]);
  const dayPart = getDayPart(now, tripTimezone);
  const currentId = journey.destinationId ?? selected;
  const current = destinationById[currentId];
  const baliTime = getLocalTimeParts(now, tripTimezone).label;
  const warsawTime = getLocalTimeParts(now, referenceTimezone).label;

  const copy =
    lang === "pl"
      ? {
          planned: "Według planu podróży",
          next: "Następnie",
          schedule: "Plan podróży",
          today: "Dzisiaj",
          preview: "Podgląd czasu",
          real: "Prawdziwy czas",
          reset: "13 wrz · 20:15",
          admin: "Admin",
          traveling: "Karo jest w drodze",
          before: "Podróż jeszcze się nie zaczęła",
          after: "Podróż zakończona",
          tripPlan: "11–26 września",
          places: "4 miejsca",
          weather: "Pogoda",
          partialCloud: "Częściowe zachmurzenie",
          freeTime: "Czas wolny",
          travel: "Podróż",
          mapNote: "Schematyczna mapa · lokalizacje orientacyjne",
        }
      : {
          planned: "Following the planned journey",
          next: "Next",
          schedule: "Trip plan",
          today: "Today",
          preview: "Time preview",
          real: "Real time",
          reset: "Sep 13 · 20:15",
          admin: "Admin",
          traveling: "Karo is travelling",
          before: "The trip has not started yet",
          after: "Trip completed",
          tripPlan: "11–26 September",
          places: "4 places",
          weather: "Weather",
          partialCloud: "Partly cloudy",
          freeTime: "Free time",
          travel: "Travel",
          mapNote: "Schematic map · approximate locations",
        };

  const title =
    journey.status === "traveling"
      ? copy.traveling
      : journey.status === "before"
        ? copy.before
        : journey.status === "after"
          ? copy.after
          : `${lang === "pl" ? "Karo jest w" : "Karo is in"} ${current.name}`;

  return (
    <main className={`app-shell theme-${dayPart}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>Karo Trip</span>
        </div>

        <div className="top-actions">
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === "pl" ? "en" : "pl")}
          >
            {lang === "pl" ? "PL · EN" : "EN · PL"}
          </button>
          <button className="admin-link">{copy.admin}</button>
        </div>
      </header>

      <section className="hero-bar">
        <div>
          <div className="eyebrow">{formatTripDate(now)}</div>
          <h1>{title}</h1>
          <p>{copy.planned}</p>
        </div>

        <div className="time-stack">
          <div className="time-main">
            {dayPart === "night" ? "☾" : dayPart === "sunset" ? "☀︎" : "◌"}{" "}
            {baliTime}
          </div>
          <div className="time-home">
            Bali · {warsawTime} Warszawa
          </div>
        </div>
      </section>

      <section className="map-card">
        <div className="map-watermark">BALI</div>
        <div className="map-note">{copy.mapNote}</div>

        <svg
          className="map-svg"
          viewBox="0 0 1000 640"
          role="img"
          aria-label="Schematyczna mapa podróży Karo"
        >
          <path
            className="island-main"
            d="M170 255 C250 190 340 185 440 210 C485 220 545 215 595 185 C635 160 705 165 742 205 C766 232 760 270 725 284 C675 304 629 290 582 310 C520 337 450 350 385 333 C322 317 261 334 205 319 C168 309 148 284 170 255 Z"
          />
          <path
            className="island-small"
            d="M690 378 C730 350 791 354 823 382 C846 403 833 428 800 438 C760 450 714 439 694 419 C681 405 678 390 690 378 Z"
          />
          <path
            className="island-small"
            d="M835 260 C865 244 910 251 930 270 C944 284 936 300 912 307 C884 315 851 305 838 292 C828 281 826 269 835 260 Z"
          />
          <path
            className="route-line"
            d="M355 320 C450 235 690 395 865 280"
          />

          {destinations.map((destination) => {
            const [x, y] = points[destination.id];
            const isCurrent = destination.id === currentId;

            return (
              <g
                key={destination.id}
                className={`destination-group ${isCurrent ? "active" : ""}`}
                onClick={() => setSelected(destination.id)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 25 : 17}
                  className="destination-ring"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  className="destination-dot"
                />
                <text x={x + 18} y={y - 11} className="destination-label">
                  {destination.name}
                </text>
              </g>
            );
          })}

          <g
            className="karo-marker"
            transform={`translate(${points[currentId][0]},${points[currentId][1]})`}
          >
            <circle cx="0" cy="-24" r="18" className="avatar-halo" />
            <circle cx="0" cy="-24" r="10" className="avatar-head" />
            <path
              className="avatar-body"
              d="M-13 2 Q0 -12 13 2 L10 24 L-10 24 Z"
            />
            <text x="18" y="-22" className="avatar-name">
              Karo
            </text>
          </g>
        </svg>
      </section>

      <section className="info-row">
        <div className="now-card">
          <div className="card-kicker">{copy.today}</div>
          <div className="now-location">
            <span className="pin">●</span>
            {current.name}
          </div>
          <div className="activity-row">
            <span className="activity-icon">
              {journey.currentItem?.type === "meal"
                ? "🍜"
                : journey.status === "traveling"
                  ? "🚤"
                  : "🌿"}
            </span>
            <div>
              <strong>
                {journey.currentItem?.title ??
                  (journey.status === "traveling"
                    ? copy.travel
                    : copy.freeTime)}
              </strong>
              <span>
                {journey.currentItem
                  ? formatTime(journey.currentItem.startAt)
                  : copy.planned}
              </span>
            </div>
          </div>
        </div>

        <div className="next-card">
          <div className="card-kicker">{copy.next}</div>
          {journey.nextItem ? (
            <>
              <div className="next-title">{journey.nextItem.title}</div>
              <div className="next-meta">
                {formatTime(journey.nextItem.startAt)} ·{" "}
                {destinationById[journey.nextItem.destinationId].name}
              </div>
            </>
          ) : (
            <div className="next-title">—</div>
          )}
        </div>

        <div className="weather-card">
          <div className="card-kicker">{copy.weather}</div>
          <div className="weather-main">28°</div>
          <div className="weather-meta">☁︎ {copy.partialCloud}</div>
        </div>
      </section>

      <section className="timeline-card">
        <div className="section-heading">
          <div>
            <div className="card-kicker">{copy.schedule}</div>
            <h2>{copy.tripPlan}</h2>
          </div>
          <div className="journey-progress">{copy.places}</div>
        </div>

        <div className="timeline">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              className={`timeline-stop ${destination.id === currentId ? "current" : ""}`}
              onClick={() => setSelected(destination.id)}
            >
              <span className="timeline-dot">{index + 1}</span>
              <span className="timeline-text">
                <strong>{destination.name}</strong>
                <small>
                  {itinerary.find(
                    (item) => item.destinationId === destination.id,
                  )?.startAt.slice(8, 10) ?? ""}{" "}
                  wrz
                </small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="preview-card">
        <div>
          <div className="card-kicker">{copy.preview}</div>
          <strong>
            {preview ? previewTime.replace("T", " · ") : "Aktualny czas"}
          </strong>
        </div>

        <div className="preview-actions">
          <input
            aria-label="Preview time"
            type="datetime-local"
            value={previewTime}
            onChange={(event) => {
              setPreview(true);
              setPreviewTime(event.target.value);
            }}
          />
          <button onClick={() => setPreview(!preview)}>
            {preview ? copy.real : copy.preview}
          </button>
          <button
            className="ghost"
            onClick={() => {
              setPreview(true);
              setPreviewTime(DEMO_TIME);
            }}
          >
            {copy.reset}
          </button>
        </div>
      </section>
    </main>
  );
}
