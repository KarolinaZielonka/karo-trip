export type DestinationId =
  | "ubud"
  | "nusa-lembongan"
  | "gili-trawangan"
  | "uluwatu";

export type ActivityType =
  | "stay"
  | "activity"
  | "meal"
  | "travel"
  | "free_time";

export type Destination = {
  id: DestinationId;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

export type ItineraryItem = {
  id: string;
  title: string;
  type: ActivityType;
  destinationId: DestinationId;
  startAt: string;
  endAt?: string;
  details?: string;
};

export type TravelSegment = {
  id: string;
  type: "ferry" | "transfer";
  from: DestinationId;
  to: DestinationId;
  startAt: string;
  endAt: string;
  provider: string;
};

export const tripTimezone = "Asia/Makassar";
export const referenceTimezone = "Europe/Warsaw";

export const destinations: Destination[] = [
  {
    id: "ubud",
    name: "Ubud",
    subtitle: "Bali",
    latitude: -8.5069,
    longitude: 115.2625,
  },
  {
    id: "nusa-lembongan",
    name: "Nusa Lembongan",
    subtitle: "Nusa Islands",
    latitude: -8.6771,
    longitude: 115.4528,
  },
  {
    id: "gili-trawangan",
    name: "Gili Trawangan",
    subtitle: "Lombok",
    latitude: -8.3502,
    longitude: 116.0408,
  },
  {
    id: "uluwatu",
    name: "Uluwatu",
    subtitle: "South Bali",
    latitude: -8.829,
    longitude: 115.0849,
  },
];

export const itinerary: ItineraryItem[] = [
  {
    id: "ubud-stay",
    title: "Villa Niyamas Ubud",
    type: "stay",
    destinationId: "ubud",
    startAt: "2026-09-11T15:00:00+08:00",
    endAt: "2026-09-15T11:00:00+08:00",
  },
  {
    id: "waterfalls",
    title: "Wodospady",
    type: "activity",
    destinationId: "ubud",
    startAt: "2026-09-13T06:00:00+08:00",
    endAt: "2026-09-13T14:00:00+08:00",
  },
  {
    id: "hujan",
    title: "Kolacja w Hujan Locale",
    type: "meal",
    destinationId: "ubud",
    startAt: "2026-09-13T20:30:00+08:00",
    endAt: "2026-09-13T22:15:00+08:00",
  },
  {
    id: "laughing-buddha",
    title: "Laughing Buddha",
    type: "activity",
    destinationId: "ubud",
    startAt: "2026-09-13T22:30:00+08:00",
    endAt: "2026-09-14T00:00:00+08:00",
  },
  {
    id: "locavore",
    title: "Urodzinowa kolacja w Locavore NX",
    type: "meal",
    destinationId: "ubud",
    startAt: "2026-09-14T19:30:00+08:00",
    endAt: "2026-09-14T22:30:00+08:00",
  },
  {
    id: "mahagiri",
    title: "Mahagiri Resort",
    type: "stay",
    destinationId: "nusa-lembongan",
    startAt: "2026-09-15T15:30:00+08:00",
    endAt: "2026-09-18T09:00:00+08:00",
  },
  {
    id: "pearl",
    title: "Pearl of Trawangan",
    type: "stay",
    destinationId: "gili-trawangan",
    startAt: "2026-09-18T12:00:00+08:00",
    endAt: "2026-09-22T10:30:00+08:00",
  },
  {
    id: "snorkelling",
    title: "Snorkelling",
    type: "activity",
    destinationId: "gili-trawangan",
    startAt: "2026-09-21T10:00:00+08:00",
    endAt: "2026-09-21T14:00:00+08:00",
  },
  {
    id: "moana",
    title: "Moana Villa & Suites",
    type: "stay",
    destinationId: "uluwatu",
    startAt: "2026-09-22T16:00:00+08:00",
    endAt: "2026-09-26T11:00:00+08:00",
  },
];

export const travelSegments: TravelSegment[] = [
  {
    id: "ferry-lembongan",
    type: "ferry",
    from: "ubud",
    to: "nusa-lembongan",
    startAt: "2026-09-15T13:15:00+08:00",
    endAt: "2026-09-15T15:00:00+08:00",
    provider: "Dcamel Fast Ferry",
  },
  {
    id: "ferry-gili",
    type: "ferry",
    from: "nusa-lembongan",
    to: "gili-trawangan",
    startAt: "2026-09-18T09:30:00+08:00",
    endAt: "2026-09-18T11:25:00+08:00",
    provider: "Wijaya Buyuk",
  },
  {
    id: "ferry-serangan",
    type: "ferry",
    from: "gili-trawangan",
    to: "uluwatu",
    startAt: "2026-09-22T11:25:00+08:00",
    endAt: "2026-09-22T16:00:00+08:00",
    provider: "BlueWater Express + taxi transfer",
  },
];

export const destinationById = Object.fromEntries(
  destinations.map((destination) => [destination.id, destination]),
) as Record<DestinationId, Destination>;
