import { BaseService } from "./base.service";
import { logger } from "../logger";

export interface MaintenanceWindow {
  startTime: Date;
  endTime: Date;
  active: boolean;
}

/**
 * Enterprise Platform Maintenance & Degradation Service.
 * Manages global maintenance locks, read-only mode database guards,
 * rolling window scheduling, and background job suspension.
 */
export class MaintenanceService extends BaseService {
  private static maintenanceMode = false;
  private static readOnlyMode = false;
  private static scheduledWindows: MaintenanceWindow[] = [];
  private static jobsSuspended = false;

  /**
   * Evaluates if the platform is currently locked for maintenance.
   */
  public isMaintenanceActive(): boolean {
    // Also check if any scheduled window is currently active
    const now = Date.now();
    const activeWindow = MaintenanceService.scheduledWindows.find(
      (w) => w.startTime.getTime() <= now && w.endTime.getTime() >= now
    );

    if (activeWindow) {
      if (!activeWindow.active) {
        activeWindow.active = true;
        MaintenanceService.maintenanceMode = true;
        MaintenanceService.jobsSuspended = true;
        logger.warn("[MaintenanceService] Scheduled window started. Maintenance lock engaged.");
      }
      return true;
    }

    return MaintenanceService.maintenanceMode;
  }

  /**
   * Evaluates if database mutating actions are barred due to Read-Only mode.
   */
  public isReadOnlyActive(): boolean {
    return MaintenanceService.readOnlyMode || this.isMaintenanceActive();
  }

  /**
   * Engages or disengages global maintenance lock.
   */
  public setMaintenanceMode(active: boolean): void {
    MaintenanceService.maintenanceMode = active;
    MaintenanceService.jobsSuspended = active;
    logger.warn(`[MaintenanceService] Maintenance mode updated to: ${active}`);
  }

  /**
   * Engages or disengages database read-only restriction.
   */
  public setReadOnlyMode(active: boolean): void {
    MaintenanceService.readOnlyMode = active;
    logger.warn(`[MaintenanceService] Read-only database guard updated to: ${active}`);
  }

  /**
   * Registers a future window interval where maintenance lock will engage automatically.
   */
  public scheduleMaintenanceWindow(startTime: Date, endTime: Date): void {
    MaintenanceService.scheduledWindows.push({
      startTime,
      endTime,
      active: false
    });
    logger.info(`[MaintenanceService] Scheduled maintenance window registered: ${startTime.toISOString()} to ${endTime.toISOString()}`);
  }

  /**
   * Suspension flag status check for background queue schedulers.
   */
  public areJobsSuspended(): boolean {
    return MaintenanceService.jobsSuspended;
  }

  /**
   * Suspends background execution loops.
   */
  public suspendJobs(suspend: boolean): void {
    MaintenanceService.jobsSuspended = suspend;
    logger.info(`[MaintenanceService] Background tasks suspension set to: ${suspend}`);
  }
}
export const maintenanceService = new MaintenanceService();
export default maintenanceService;
