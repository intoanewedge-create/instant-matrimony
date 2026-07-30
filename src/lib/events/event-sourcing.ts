import { EventStore } from "./event-store";
import { DomainEvent } from "./domain-event";

export class SnapshotStore {
  private store = new Map<string, { state: any; version: number; updatedAt: Date }>();

  async save(streamId: string, state: any, version: number): Promise<void> {
    this.store.set(streamId, {
      state: JSON.parse(JSON.stringify(state)),
      version,
      updatedAt: new Date()
    });
  }

  async get(streamId: string): Promise<{ state: any; version: number } | null> {
    const item = this.store.get(streamId);
    return item ? { state: item.state, version: item.version } : null;
  }
}

export class AggregateRebuilder {
  constructor(private eventStore: EventStore, private snapshotStore: SnapshotStore) {}

  async rebuild<T>(
    streamId: string,
    factory: () => T,
    apply: (state: T, event: DomainEvent) => T
  ): Promise<T> {
    const snapshot = await this.snapshotStore.get(streamId);
    let state = factory();
    let startVersion = 0;

    if (snapshot) {
      state = snapshot.state as T;
      startVersion = snapshot.version;
    }

    const events = await this.eventStore.getEvents(streamId);
    const subsequentEvents = events.slice(startVersion);

    for (const event of subsequentEvents) {
      state = apply(state, event);
    }

    return state;
  }
}

export class ProjectionEngine {
  private projections = new Map<string, (event: DomainEvent) => Promise<void> | void>();

  register(eventName: string, project: (event: DomainEvent) => Promise<void> | void) {
    this.projections.set(eventName, project);
  }

  async handle(event: DomainEvent): Promise<void> {
    const handler = this.projections.get(event.name);
    if (handler) {
      await handler(event);
    }
  }
}

export class ReplayEngine {
  constructor(private eventStore: EventStore) {}

  async replayEvents(fromDate: Date, handler: (event: DomainEvent) => Promise<void> | void): Promise<void> {
    const events = await this.eventStore.getAllEvents(fromDate);
    for (const event of events) {
      await handler(event);
    }
  }
}
