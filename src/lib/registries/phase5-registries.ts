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
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Embedding provider not configured`);
    return provider;
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
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Search provider not configured`);
    return provider;
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
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Rule provider not configured`);
    return provider;
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
    const exporter = this.exporters.get(this.active);
    if (!exporter) throw new Error(`Exporter not configured`);
    return exporter;
  }
}

export class ExperimentProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "bayesian";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Experiment provider not configured`);
    return provider;
  }
}

export class LocalizationProviderRegistry {
  private providers = new Map<string, RegistryProvider>();
  private active = "default";

  register(name: string, provider: RegistryProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getActive(): RegistryProvider {
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Localization provider not configured`);
    return provider;
  }
}

export class MessageBrokerProvider implements RegistryProvider {
  name = "NatsBroker";
  
  async health(): Promise<boolean> {
    return true;
  }

  async publish(_topic: string, _message: any): Promise<void> {
    throw new Error("Message broker not implemented");
  }

  async subscribe(_topic: string, _handler: (msg: any) => void): Promise<void> {
    throw new Error("Message broker not implemented");
  }
}
