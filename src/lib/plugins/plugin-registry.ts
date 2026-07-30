import { Result } from "../result";
import { logger } from "../logger";

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  widgets?: string[];
  routes?: string[];
  menuItems?: string[];
}

export interface IPlugin {
  metadata: PluginMetadata;
  initialize(): Promise<Result<boolean>>;
  getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }>;
}

/**
 * Enterprise Plugin Registry.
 * Coordinates discovery, activation, dynamic routing integrations,
 * and health status reporting of modular third-party extensions.
 */
export class PluginRegistry {
  private plugins = new Map<string, IPlugin>();

  /**
   * Registers and initializes a new plugin.
   *
   * @param plugin - Plugin instance to load.
   */
  public async registerPlugin(plugin: IPlugin): Promise<Result<boolean>> {
    const { id, name } = plugin.metadata;
    logger.info(`[PluginRegistry] Registering plugin: ${name} (${id}).`);

    try {
      const initResult = await plugin.initialize();
      if (!initResult.success) {
        logger.error(`[PluginRegistry] Plugin initialization failed for ${id}: ${initResult.error}`);
        return initResult;
      }
      this.plugins.set(id, plugin);
      return { success: true, data: true };
    } catch (err: any) {
      logger.error(`[PluginRegistry] Failed to initialize plugin ${id}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Unregisters an active plugin.
   */
  public unregisterPlugin(id: string): void {
    if (this.plugins.has(id)) {
      this.plugins.delete(id);
      logger.info(`[PluginRegistry] Unregistered plugin: ${id}`);
    }
  }

  /**
   * Retrieves all loaded plugins.
   */
  public getActivePlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Retrieves all registered admin operations widgets across plugins.
   */
  public getDynamicWidgets(): string[] {
    const widgets: string[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.metadata.widgets) {
        widgets.push(...plugin.metadata.widgets);
      }
    }
    return widgets;
  }

  /**
   * Retrieves all registered custom admin routes.
   */
  public getDynamicRoutes(): string[] {
    const routes: string[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.metadata.routes) {
        routes.push(...plugin.metadata.routes);
      }
    }
    return routes;
  }

  /**
   * Runs diagnostic health checks on all loaded plugins.
   */
  public async runHealthDiagnostics(): Promise<Record<string, { status: "UP" | "DOWN"; latencyMs: number }>> {
    const report: Record<string, { status: "UP" | "DOWN"; latencyMs: number }> = {};
    for (const [id, plugin] of this.plugins.entries()) {
      try {
        report[id] = await plugin.getHealth();
      } catch {
        report[id] = { status: "DOWN", latencyMs: 0 };
      }
    }
    return report;
  }
}

export const pluginRegistry = new PluginRegistry();
export default pluginRegistry;
