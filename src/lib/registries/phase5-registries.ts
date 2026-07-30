export interface RegistryProvider {
  name: string;
  health(): Promise<boolean>;
}

export class EmbeddingProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "default";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    return this.providers.get(this.active) || { name: "mock-embedding", health: async () => true };
  }

  setActive(name: string) {
    this.active = name.toLowerCase();
  }
}

export class SearchProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "opensearch";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    return this.providers.get(this.active) || { name: "mock-search", health: async () => true };
  }

  setActive(name: string) {
    this.active = name.toLowerCase();
  }
}

export class NotificationTemplateRegistry {
  private templates = new Map<string, string>();

  register(key: string, template: string) {
    this.templates.set(key, template);
  }

  getTemplate(key: string): string | null {
    return this.templates.get(key) || null;
  }
}

export class RuleProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "default";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    return this.providers.get(this.active) || { name: "mock-rules", health: async () => true };
  }
}

export class PolicyRegistry {
  private policies = new Map<string, any>();

  register(id: string, policy: any) {
    this.policies.set(id, policy);
  }

  get(id: string): any {
    return this.policies.get(id) || null;
  }
}

export class ReportExporterRegistry {
  private exporters = new Map<string, RegistryProvider>();
  private active = "pdf";

  register(name: string, exporter: RegistryProvider) {
    this.exporters.set(name.toLowerCase(), exporter);
  }

  getActive(): RegistryProvider {
    return this.exporters.get(this.active) || { name: "mock-exporter", health: async () => true };
  }
}

export class ExperimentProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "bayesian";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    return this.providers.get(this.active) || { name: "mock-experiments", health: async () => true };
  }
}

export class LocalizationProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "default";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    return this.providers.get(this.active) || { name: "mock-localization", health: async () => true };
  }
}

export class MessageBrokerProvider implements RegistryProvider {
  name = "NatsBroker";
  
  async health(): Promise<boolean> {
    return true;
  }

  async publish(topic: string, message: any): Promise<void> {
    // mock streaming broker publish
  }

  async subscribe(topic: string, handler: (msg: any) => void): Promise<void> {
    // mock streaming broker subscribe
  }
}
