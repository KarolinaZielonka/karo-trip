import {
  destinationById,
  itinerary,
  travelSegments,
  type DestinationId,
  type ItineraryItem,
} from "./trip";

export type JourneyState = {
  status: "before" | "traveling" | "activity" | "staying" | "after";
  destinationId?: DestinationId;
  currentItem?: ItineraryItem;
  nextItem?: ItineraryItem;
  activeTravel?: (typeof travelSegments)[number];
  progress?: number;
};

export function getJourneyState(now: Date): JourneyState {
  const travel = travelSegments.find(
    (segment) =>
      now >= new Date(segment.startAt) && now < new Date(segment.endAt),
  );

  if (travel) {
    const total =
      new Date(travel.endAt).getTime() - new Date(travel.startAt).getTime();
    const elapsed = now.getTime() - new Date(travel.startAt).getTime();

    return {
      status: "traveling",
      destinationId: travel.from,
      activeTravel: travel,
      progress: Math.min(1, Math.max(0, elapsed / total)),
      nextItem: itinerary
        .filter((item) => new Date(item.startAt) > now)
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        )[0],
    };
  }

  const active = itinerary
    .filter(
      (item) =>
        now.getTime() >= new Date(item.startAt).getTime() &&
        now.getTime() <
          (item.endAt
            ? new Date(item.endAt).getTime()
            : new Date(item.startAt).getTime() + 3_600_000),
    )
    .sort(
      (a, b) =>
        new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );

  const current = active[0];
  const next = itinerary
    .filter((item) => new Date(item.startAt).getTime() > now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )[0];

  if (current) {
    return {
      status: current.type === "stay" ? "staying" : "activity",
      destinationId: current.destinationId,
      currentItem: current,
      nextItem: next,
    };
  }

  if (now < new Date(itinerary[0].startAt)) {
    return {
      status: "before",
      nextItem: itinerary[0],
    };
  }

  return {
    status: "after",
  };
}

export function getInterpolatedPosition(state: JourneyState) {
  if (!state.activeTravel) return;

  const from = destinationById[state.activeTravel.from];
  const to = destinationById[state.activeTravel.to];
  const progress = state.progress ?? 0;

  return {
    latitude: from.latitude + (to.latitude - from.latitude) * progress,
    longitude: from.longitude + (to.longitude - from.longitude) * progress,
  };
}

export function getLocalTimeParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
    label: formatter.format(date),
  };
}

export function getDayPart(date: Date, timeZone: string) {
  const hour = getLocalTimeParts(date, timeZone).hour;

  if (hour < 6) return "night" as const;
  if (hour < 7.5) return "dawn" as const;
  if (hour < 17.5) return "day" as const;
  if (hour < 19) return "sunset" as const;

  return "night" as const;
}
