export const createReservationSchema = {
  type: "object",
  required: ["seatIds"],
  properties: {
    seatIds: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 1 },
    },
  },
} as const;

export type CreateReservationBody = {
  seatIds: string[];
};
