import { DomainEvent } from "./domain-event";

/**
 * Interface representing an enterprise event store for persisting,
 * versioning, and replaying domain events.
 */
export interface IEventStore {
  /**
   * Saves a collection of domain events to the persistent store.
   * Supports optimistic concurrency via expectedVersion checks.
   *
   * @param streamId - The unique identifier of the event stream/aggregate.
   * @param events - The array of domain events to save.
   * @param expectedVersion - The expected current version of the stream.
   * @param correlationId - Correlation ID to trace the causation chain.
   */
  save(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number,
    correlationId?: string
  ): Promise<void>;

  /**
   * Retrieves all events associated with a specific stream/aggregate.
   *
   * @param streamId - The unique identifier of the stream/aggregate.
   * @returns A promise resolving to an array of domain events.
   */
  getEvents(streamId: string): Promise<DomainEvent[]>;

  /**
   * Retrieves all events across all streams filtered by a starting date/time.
   * Useful for event replay and read model reconstruction.
   *
   * @param fromDate - Optional date to start querying events from.
   * @returns A promise resolving to an array of all matched domain events.
   */
  getAllEvents(fromDate?: Date): Promise<DomainEvent[]>;

  /**
   * Saves a state snapshot of an aggregate stream to optimize reconstruction.
   *
   * @param streamId - The unique aggregate identifier.
   * @param snapshotState - The serialized state of the aggregate.
   * @param version - The version number at which the snapshot was captured.
   */
  saveSnapshot(streamId: string, snapshotState: any, version: number): Promise<void>;

  /**
   * Retrieves the latest snapshot for a specific aggregate stream.
   *
   * @param streamId - The aggregate identifier.
   * @returns The snapshot state and version, or null if no snapshot exists.
   */
  getSnapshot(streamId: string): Promise<{ state: any; version: number } | null>;
}
