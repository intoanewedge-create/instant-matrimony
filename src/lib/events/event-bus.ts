import { DomainEvent } from "./domain-event";

/**
 * Interface representing an enterprise event bus for publishing and replaying domain events.
 */
export interface IEventBus {
  /**
   * Publishes a domain event to all subscribed handlers.
   * Supports correlation tracking and metadata injection.
   *
   * @param event - The domain event to publish.
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Subscribes a handler function to be executed when an event with the matching name is published.
   *
   * @param eventName - The target domain event name.
   * @param handler - The callback handler.
   */
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void> | void): void;

  /**
   * Unsubscribes a handler from the event dispatcher.
   *
   * @param eventName - The target event name.
   * @param handler - The callback to remove.
   */
  unsubscribe(eventName: string, handler: (event: DomainEvent) => Promise<void> | void): void;

  /**
   * Replays events from the persisted event store matching the event name since a given date.
   *
   * @param eventName - The target event name.
   * @param fromDate - The date to start replaying events from.
   */
  replay(eventName: string, fromDate: Date): Promise<void>;
}

// Retain legacy EventBus alias for backward compatibility in the container and services
export type EventBus = IEventBus;
