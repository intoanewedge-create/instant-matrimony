import { IEventStore } from "./event-store.interface";
import { DomainEvent } from "./domain-event";
import { Result } from "../result";
import { logger } from "../logger";

interface PersistedEventRecord {
  streamId: string;
  eventName: string;
  version: number;
  occurredAt: Date;
  data: any;
  correlationId?: string;
  metadata?: any;
}

interface SnapshotRecord {
  streamId: string;
  state: any;
  version: number;
  updatedAt: Date;
}

/**
 * Concrete implementation of the enterprise Event Store using in-memory
 * registry with support for optimistic concurrency, snapshots, and migrations.
 */
export class EventStore implements IEventStore {
  private static events: PersistedEventRecord[] = [];
  private static snapshots: Map<string, SnapshotRecord> = new Map();
  private migrations: Map<string, Map<number, (data: any) => any>> = new Map();

  constructor() {
    this.registerDefaultMigrations();
  }

  /**
   * Registers a migration function to transform an event from a specific old version to a newer schema.
   *
   * @param eventName - Name of the event.
   * @param sourceVersion - The version of the event before migration.
   * @param migrationFn - Function performing the transformation.
   */
  public registerMigration(
    eventName: string,
    sourceVersion: number,
    migrationFn: (data: any) => any
  ): void {
    if (!this.migrations.has(eventName)) {
      this.migrations.set(eventName, new Map());
    }
    this.migrations.get(eventName)!.set(sourceVersion, migrationFn);
  }

  /**
   * Saves a collection of domain events to the persistent store.
   * Enforces optimistic concurrency check.
   */
  public async save(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number,
    correlationId?: string
  ): Promise<void> {
    const existingEvents = EventStore.events.filter((e) => e.streamId === streamId);
    const currentVersion = existingEvents.length > 0 
      ? Math.max(...existingEvents.map((e) => e.version)) 
      : 0;

    if (expectedVersion !== -1 && currentVersion !== expectedVersion) {
      throw new Error(
        `Optimistic Concurrency Exception: Stream ${streamId} is at version ${currentVersion}, expected version ${expectedVersion}`
      );
    }

    let nextVersion = currentVersion + 1;
    for (const event of events) {
      EventStore.events.push({
        streamId,
        eventName: event.name,
        version: nextVersion++,
        occurredAt: event.occurredAt || new Date(),
        data: event.data,
        correlationId,
        metadata: {
          eventVersion: 1,
          timestamp: new Date().getTime()
        }
      });
    }

    logger.info(`Saved ${events.length} events for stream ${streamId}. Current version is now ${nextVersion - 1}.`);
  }

  /**
   * Retrieves all events associated with a specific stream/aggregate, running them through registered migrations.
   */
  public async getEvents(streamId: string): Promise<DomainEvent[]> {
    const records = EventStore.events
      .filter((e) => e.streamId === streamId)
      .sort((a, b) => a.version - b.version);

    return records.map((record) => {
      let migratedData = { ...record.data };
      let currentVer = record.metadata?.eventVersion || 1;

      // Apply migrations if present
      const eventMigrations = this.migrations.get(record.eventName);
      if (eventMigrations) {
        while (eventMigrations.has(currentVer)) {
          const migration = eventMigrations.get(currentVer)!;
          migratedData = migration(migratedData);
          currentVer++;
        }
      }

      return {
        name: record.eventName,
        occurredAt: record.occurredAt,
        data: migratedData,
        version: currentVer,
        streamId: record.streamId,
        correlationId: record.correlationId
      } as any;
    });
  }

  /**
   * Retrieves all events across all streams filtered by a starting date/time.
   */
  public async getAllEvents(fromDate?: Date): Promise<DomainEvent[]> {
    let records = [...EventStore.events];
    if (fromDate) {
      records = records.filter((e) => e.occurredAt.getTime() >= fromDate.getTime());
    }

    return records.map((record) => ({
      name: record.eventName,
      occurredAt: record.occurredAt,
      data: record.data,
      correlationId: record.correlationId
    } as DomainEvent));
  }

  /**
   * Saves a state snapshot of an aggregate stream to optimize reconstruction.
   */
  public async saveSnapshot(streamId: string, snapshotState: any, version: number): Promise<void> {
    EventStore.snapshots.set(streamId, {
      streamId,
      state: JSON.parse(JSON.stringify(snapshotState)),
      version,
      updatedAt: new Date()
    });
    logger.info(`Snapshot saved for stream ${streamId} at version ${version}.`);
  }

  /**
   * Retrieves the latest snapshot for a specific aggregate stream.
   */
  public async getSnapshot(streamId: string): Promise<{ state: any; version: number } | null> {
    const record = EventStore.snapshots.get(streamId);
    if (!record) return null;
    return {
      state: { ...record.state },
      version: record.version
    };
  }

  /**
   * Reconstructs an aggregate's state by playing the snapshot and any subsequent events.
   *
   * @param streamId - The aggregate stream identifier.
   * @param aggregateCreator - A factory function to create a new aggregate instance.
   * @param applyEventFn - A function to mutate state based on an event.
   */
  public async reconstructAggregate<T>(
    streamId: string,
    aggregateCreator: () => T,
    applyEventFn: (state: T, event: DomainEvent) => T
  ): Promise<T> {
    const snapshot = await this.getSnapshot(streamId);
    let aggregate = aggregateCreator();
    let startVersion = 0;

    if (snapshot) {
      aggregate = snapshot.state as T;
      startVersion = snapshot.version;
    }

    const events = await this.getEvents(streamId);
    const postSnapshotEvents = events.filter((_, index) => index >= startVersion);

    for (const event of postSnapshotEvents) {
      aggregate = applyEventFn(aggregate, event);
    }

    return aggregate;
  }

  private registerDefaultMigrations(): void {
    // Stub default event migration to demonstrate event migrations
    this.registerMigration("UserRegistered", 1, (data) => {
      // Map version 1 (old) registration to version 2
      if (!data.roles) {
        data.roles = ["USER"];
      }
      return data;
    });
  }
}
