import { env } from "../../config/env.js"
import type {
  ReservationDetail,
  ReservationsRepository,
} from "../../@repositories/reservations-repository.js"
import { InvalidSeatSelectionError } from "../errors/invalid-seat-selection-error.js"
import { UserNotFoundError } from "../errors/user-not-found-error.js"
import { makeReservationsRepository } from "../factories/make-reservations-repository.js"

export type CreateReservationInput = {
  sessionId: string
  userId: string
  seatIds: string[]
}

export class CreateReservationUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute(input: CreateReservationInput): Promise<ReservationDetail> {
    const seatIds = [...new Set(input.seatIds)]
    if (seatIds.length === 0) {
      throw new InvalidSeatSelectionError("Select at least one seat.")
    }

    if (!(await this.reservationsRepository.userExists(input.userId))) {
      throw new UserNotFoundError()
    }

    const expiresAt = new Date(Date.now() + env.RESERVATION_TTL_SECONDS * 1000)

    return this.reservationsRepository.createHold({
      sessionId: input.sessionId,
      userId: input.userId,
      seatIds,
      expiresAt,
    })
  }
}

export function makeCreateReservationUseCase() {
  return new CreateReservationUseCase(makeReservationsRepository())
}
