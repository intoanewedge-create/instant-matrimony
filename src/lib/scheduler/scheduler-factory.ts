import { IScheduler } from "./scheduler.interface";
import { MemoryScheduler } from "./providers/memory-scheduler";
import { BullMQScheduler } from "./providers/bullmq-scheduler";
import { TriggerDevScheduler } from "./providers/trigger-dev-scheduler";
import { InngestScheduler } from "./providers/inngest-scheduler";

export class SchedulerFactory {
  static create(providerType: string): IScheduler {
    switch (providerType.toLowerCase()) {
      case "bullmq":
        return new BullMQScheduler();
      case "triggerdev":
      case "trigger.dev":
        return new TriggerDevScheduler();
      case "inngest":
        return new InngestScheduler();
      case "memory":
      default:
        return new MemoryScheduler();
    }
  }
}
