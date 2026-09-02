import { PrismaEventsRepository } from '../../@repositories/prisma/prisma-events-repository.js'
import { CreateEventUseCase } from '../create-event.js'

export function makeCreateEventUseCase() {
  const eventsRepository = new PrismaEventsRepository()
  const useCase = new CreateEventUseCase(eventsRepository)

  return useCase
}
