import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get("live")
  live() {
    return this.health.live();
  }

  @Get("ready")
  async ready() {
    const report = await this.health.readiness();
    if (report.status !== "ready") {
      throw new ServiceUnavailableException(report);
    }
    return report;
  }
}
