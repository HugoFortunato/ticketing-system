export const createEventSchema = {
  type: "object",
  required: ["name", "description", "imageUrl", "category", "venueId"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    imageUrl: { type: "string", minLength: 1 },
    category: { type: "string", minLength: 1 },
    venueId: { type: "string", minLength: 1 },
  },
} as const;

export const updateEventSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    imageUrl: { type: "string", minLength: 1 },
    category: { type: "string", minLength: 1 },
    venueId: { type: "string", minLength: 1 },
  },
} as const;

export const createSessionSchema = {
  type: "object",
  required: ["startsAt", "endsAt"],
  properties: {
    startsAt: { type: "string", minLength: 1 },
    endsAt: { type: "string", minLength: 1 },
    venueId: { type: "string", minLength: 1 },
  },
} as const;

export type CreateEventBody = {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  venueId: string;
};

export type UpdateEventBody = Partial<CreateEventBody>;

export type CreateSessionBody = {
  startsAt: string;
  endsAt: string;
  venueId?: string;
};
