import { IEventBus } from "./event-bus";
import { DomainEvent } from "./domain-event";
import { loggerService } from "../services/logger.service";
import { EventStore } from "./event-store";

type EventHandler = (arg: any) => Promise<void> | void;

export interface DeadLetterRecord {
  event: DomainEvent;
  error: string;
  failedAt: Date;
}

/**
 * Enterprise Event Dispatcher implementing the IEventBus interface.
 * Tracks subscriptions, publishes events, manages retries and dead-letter queues,
 * and integrates with the EventStore for event persistence and replay.
 */
export class EventDispatcher implements IEventBus {
  private handlers = new Map<string, EventHandler[]>();
  private dlq: DeadLetterRecord[] = [];
  private eventStore = new EventStore();

  /**
   * Subscribes a handler to a specific event stream.
   */
  public subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Unsubscribes a handler from a specific event stream.
   */
  public unsubscribe(eventName: string, handler: EventHandler): void {
    const list = this.handlers.get(eventName);
    if (!list) return;
    this.handlers.set(
      eventName,
      list.filter((h) => h !== handler)
    );
  }

  /**
   * Publishes an event to all subscribed handlers.
   * Persists the event to the EventStore. Runs handlers asynchronously
   * and handles failures via retry backoffs and dead-letter queue routing.
   */
  public async publish(event: DomainEvent | string, data?: any): Promise<void> {
    let normalizedEvent: DomainEvent;
    if (typeof event === "string") {
      normalizedEvent = {
        name: event,
        occurredAt: new Date(),
        data: data || {},
      };
    } else {
      normalizedEvent = event;
    }

    const eventName = normalizedEvent.name;
    const correlationId = normalizedEvent.data?.correlationId || `corr_${Math.random().toString(36).substring(2, 15)}`;

    // Add metadata/correlation id
    normalizedEvent.data = {
      ...normalizedEvent.data,
      correlationId,
      timestamp: normalizedEvent.data?.timestamp || new Date().getTime()
    };

    loggerService.info(`[EventBus] Publishing event: ${eventName}`, { correlationId });

    // Persist event in the Event Store
    try {
      await this.eventStore.save(normalizedEvent.data?.streamId || "global", [normalizedEvent], -1, correlationId);
    } catch (err: any) {
      loggerService.error(`[EventBus] Failed to persist event ${eventName}`, {}, err);
    }

    const eventHandlers = this.handlers.get(eventName) || [];
    const promises = eventHandlers.map(async (handler) => {
      await this.executeWithRetry(handler, normalizedEvent, 3, 100); // 3 retries, 100ms base delay
    });

    // Run handlers concurrently (async handlers)
    await Promise.all(promises);
  }

  /**
   * Replays events from a given date.
   */
  public async replay(eventName: string, fromDate: Date): Promise<void> {
    loggerService.info(`[EventBus] Replaying events for ${eventName} since ${fromDate.toISOString()}`);
    const allEvents = await this.eventStore.getAllEvents(fromDate);
    const matchedEvents = allEvents.filter((e) => e.name === eventName);

    for (const event of matchedEvents) {
      const handlers = this.handlers.get(eventName) || [];
      for (const handler of handlers) {
        try {
          await handler(event.data);
        } catch (err: any) {
          loggerService.error(`[EventBus] Replay failed for ${eventName}`, {}, err);
        }
      }
    }
  }

  /**
   * Gets all dead-letter records.
   */
  public getDeadLetterQueue(): DeadLetterRecord[] {
    return [...this.dlq];
  }

  /**
   * Clears the Dead Letter Queue.
   */
  public clearDLQ(): void {
    this.dlq = [];
  }

  private async executeWithRetry(
    handler: EventHandler,
    event: DomainEvent,
    retriesLeft: number,
    delayMs: number
  ): Promise<void> {
    try {
      // Execute handler passing event data (backward compatible) or the event itself
      const result = handler(event.data);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error: any) {
      if (retriesLeft > 0) {
        loggerService.warn(
          `[EventBus] Handler failed for event ${event.name}. Retrying in ${delayMs}ms... (${retriesLeft} retries left)`,
          { error: error.message }
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        await this.executeWithRetry(handler, event, retriesLeft - 1, delayMs * 2);
      } else {
        loggerService.error(
          `[EventBus] Handler failed for event ${event.name}. Retries exhausted. Routing to Dead Letter Queue (DLQ).`,
          {},
          error
        );
        this.dlq.push({
          event,
          error: error.message || "Unknown handler error",
          failedAt: new Date()
        });
      }
    }
  }
}

export const eventDispatcher = new EventDispatcher();
export default eventDispatcher;
