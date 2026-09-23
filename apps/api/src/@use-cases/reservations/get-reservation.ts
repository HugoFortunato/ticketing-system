import type {
  ReservationDetail,
  ReservationsRepository,
} from "../../@repositories/reservations-repository.js"
import { ReservationNotFoundError } from "../errors/reservation-not-found-error.js"
import { makeReservationsRepository } from "../factories/make-reservations-repository.js"

export class GetReservationUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute(id: string): Promise<ReservationDetail> {
    const reservation = await this.reservationsRepository.findById(id)

    if (!reservation) {
      throw new ReservationNotFoundError()
    }
    
    return reservation
  }
}

export function makeGetReservationUseCase() {
  return new GetReservationUseCase(makeReservationsRepository())
}
