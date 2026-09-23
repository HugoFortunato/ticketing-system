import type {
  ReservationDetail,
  ReservationsRepository,
} from "../../@repositories/reservations-repository.js"
import { makeReservationsRepository } from "../factories/make-reservations-repository.js"

export type ConfirmReservationInput = {
  id: string
  userId: string
}

export class ConfirmReservationUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute(input: ConfirmReservationInput): Promise<ReservationDetail> {
    return this.reservationsRepository.confirmHold(input.id, input.userId)
  }
}

export function makeConfirmReservationUseCase() {
  return new ConfirmReservationUseCase(makeReservationsRepository())
}
