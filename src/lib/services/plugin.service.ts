import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { loggerService } from "./logger.service";

export interface SystemPlugin {
  id: string;
  name: string;
  enabled: boolean;
  permissions: string[];
  execute(context: any): Promise<any>;
}

/**
 * Service managing third-party sandbox integrations and plugin permission matrices.
 */
export class PluginService extends BaseService {
  private plugins = new Map<string, SystemPlugin>();

  /**
   * Registers a new modular platform plugin.
   */
  async registerPlugin(plugin: SystemPlugin): Promise<Result<void>> {
    this.plugins.set(plugin.id, plugin);
    loggerService.info(`[PluginService] Registered plugin ${plugin.name} (${plugin.id})`);
    return returnSuccess(undefined);
  }

  /**
   * Runs a plugin within a simulated capability sandbox.
   */
  async executePlugin(pluginId: string, context: any): Promise<Result<any>> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.enabled) {
      throw new Error(`Plugin ${pluginId} not found or disabled`);
    }

    // Verify sandbox permission scopes
    const requiresAdmin = plugin.permissions.includes("ADMIN");
    if (requiresAdmin && !context.userRoles?.includes("ADMIN")) {
      throw new Error(`Security Exception: Plugin ${pluginId} requires ADMIN scopes which context lacks.`);
    }

    const response = await plugin.execute(context);
    return returnSuccess(response);
  }
}
