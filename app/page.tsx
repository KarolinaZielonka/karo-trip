"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getDayPart,
  getInterpolatedPosition,
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

const mapPoints: Record<DestinationId, [number, number]> = {
  uluwatu: [230, 425],
  ubud: [500, 235],
  "nusa-lembongan": [690, 350],
  "gili-trawangan": [865, 255],
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

function formatTripDate(date: Date, language: "pl" | "en") {
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-GB", {
    timeZone: tripTimezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function lerpMapPoint(state: ReturnType<typeof getJourneyState>) {
  if (!state.activeTravel) return;

  const from = mapPoints[state.activeTravel.from];
  const to = mapPoints[state.activeTravel.to];
  const progress = state.progress ?? 0;

  return {
    x: from[0] + (to[0] - from[0]) * progress,
    y: from[1] + (to[1] - from[1]) * progress,
  };
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
  const movingPosition = lerpMapPoint(journey);
  const currentMapPoint = movingPosition ?? {
    x: mapPoints[currentId][0],
    y: mapPoints[currentId][1],
  };

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
          places: "4 miejsca",
          weather: "Pogoda",
          partialCloud: "Częściowe zachmurzenie",
          freeTime: "Czas wolny",
          travel: "Podróż",
          mapNote: "Schematyczna mapa · lokalizacje orientacyjne",
          route: "Trasa Karo",
          nextStop: "Następny przystanek",
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
          places: "4 places",
          weather: "Weather",
          partialCloud: "Partly cloudy",
          freeTime: "Free time",
          travel: "Travel",
          mapNote: "Schematic map · approximate locations",
          route: "Karo's route",
          nextStop: "Next stop",
        };

  const title =
    journey.status === "traveling"
      ? copy.traveling
      : journey.status === "before"
        ? copy.before
        : journey.status === "after"
          ? copy.after
          : `${lang === "pl" ? "Karo jest w" : "Karo is in"} ${current.name}`;

  const transportIcon =
    journey.activeTravel?.type === "ferry" ? "⛴" : "🚐";

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
          <div className="eyebrow">{formatTripDate(now, lang)}</div>
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
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(178, 222, 211, 0.8)" />
              <stop offset="100%" stopColor="rgba(238, 242, 215, 0.2)" />
            </linearGradient>
            <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.12" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1000" height="640" rx="22" fill="url(#sky)" />

          <g className="map-decor" aria-hidden="true">
            <path className="mountain-back" d="M70 280 Q150 170 235 280 T400 280" />
            <path className="mountain-front" d="M55 340 Q135 225 225 340 T395 345" />
            <path className="rice-field rice-one" d="M260 210 Q335 175 405 208 Q370 248 300 248 Q278 235 260 210 Z" />
            <path className="rice-field rice-two" d="M275 255 Q360 220 435 255 Q395 295 315 290 Q288 278 275 255 Z" />
            <path className="temple" d="M650 165 L670 130 L690 165 L678 165 L678 195 L662 195 L662 165 Z" />
            <path className="temple" d="M735 410 L755 372 L775 410 L764 410 L764 438 L746 438 L746 410 Z" />
            <path className="palm palm-one" d="M560 90 Q560 165 550 215 M560 120 Q530 95 505 105 M558 122 Q586 94 620 104 M558 140 Q528 128 502 143 M560 140 Q593 123 624 141" />
            <path className="palm palm-two" d="M825 470 Q828 420 832 390 M831 425 Q808 405 790 415 M832 425 Q853 402 876 412" />
            <circle className="sun-or-moon" cx="860" cy="90" r="34" />
            <g className="map-stars">
              <circle cx="780" cy="82" r="2" />
              <circle cx="815" cy="118" r="1.8" />
              <circle cx="915" cy="140" r="2" />
              <circle cx="720" cy="100" r="1.5" />
            </g>
          </g>

          <path className="ocean-shape" d="M95 420 Q180 380 260 430 T430 430 T610 430 T790 430 T930 420" />

          <path
            className="route-line background-route"
            d="M230 425 C315 345 418 285 500 235 C570 245 620 300 690 350 C755 330 805 285 865 255"
          />
          <path
            className="route-line active-route"
            d="M230 425 C315 345 418 285 500 235 C570 245 620 300 690 350 C755 330 805 285 865 255"
          />

          {destinations.map((destination) => {
            const [x, y] = mapPoints[destination.id];
            const isCurrent = destination.id === currentId;

            return (
              <g
                key={destination.id}
                className={`destination-group ${isCurrent ? "active" : ""}`}
                onClick={() => setSelected(destination.id)}
                role="button"
                aria-label={destination.name}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 28 : 18}
                  className="destination-ring"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  className="destination-dot"
                />
                <text x={x + 20} y={y - 15} className="destination-label">
                  {destination.name}
                </text>
              </g>
            );
          })}

          <g
            className={`karo-marker ${journey.status === "traveling" ? "is-traveling" : ""}`}
            transform={`translate(${currentMapPoint.x},${currentMapPoint.y})`}
            filter="url(#softShadow)"
          >
            {journey.status === "traveling" ? (
              <text x="0" y="-48" textAnchor="middle" className="transport-label">
                {transportIcon}
              </text>
            ) : null}

            <circle cx="0" cy="-24" r="19" className="avatar-halo" />
            <circle cx="0" cy="-24" r="11" className="avatar-head" />
            <path
              className="avatar-hair"
              d="M-11 -25 Q-9 -39 0 -39 Q10 -39 12 -25 Q6 -31 0 -28 Q-6 -31 -11 -25 Z"
            />
            <path
              className="avatar-body"
              d="M-14 2 Q0 -12 14 2 L10 26 L-10 26 Z"
            />
            <path className="avatar-leg left" d="M-5 24 L-9 36" />
            <path className="avatar-leg right" d="M5 24 L9 36" />
            <circle className="avatar-bag" cx="14" cy="5" r="5" />
            <text x="22" y="-20" className="avatar-name">
              Karo
            </text>
          </g>

          <g className="map-compass" aria-hidden="true">
            <circle cx="920" cy="540" r="28" />
            <text x="920" y="531" textAnchor="middle">N</text>
            <path d="M920 515 L915 535 L925 535 Z" />
          </g>

          <text x="60" y="570" className="map-caption">
            {journey.status === "traveling" ? copy.route : `${copy.nextStop}: ${journey.nextItem ? destinationById[journey.nextItem.destinationId].name : "—"}`}
          </text>
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
                  ? transportIcon
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
            <h2>{lang === "pl" ? "11–26 września" : "11–26 September"}</h2>
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
                  {lang === "pl" ? "wrz" : "Sep"}
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
