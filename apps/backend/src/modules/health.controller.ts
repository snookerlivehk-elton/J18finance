import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('/health')
  health() {
    return { ok: true }
  }
  @Get('/health/db')
  async db() {
    const count = await this.prisma.entry.count()
    return { ok: true, entries: count }
  }
}
