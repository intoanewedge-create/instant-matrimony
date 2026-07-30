import { Result } from "../result";
import { logger } from "../logger";

export interface ICommand {
  readonly correlationId?: string;
  readonly timestamp?: Date;
}

export interface IQuery {
  readonly correlationId?: string;
}

export interface ICommandHandler<TCommand extends ICommand = any, TResult = any> {
  execute(command: TCommand): Promise<Result<TResult>>;
}

export interface IQueryHandler<TQuery extends IQuery = any, TResult = any> {
  execute(query: TQuery): Promise<Result<TResult>>;
}

/**
 * Command Bus resolving and executing command handlers.
 */
export class CommandBus {
  private handlers = new Map<string, ICommandHandler<any, any>>();

  /**
   * Registers a command handler.
   */
  public register<TCommand extends ICommand>(
    commandName: string,
    handler: ICommandHandler<TCommand>
  ): void {
    this.handlers.set(commandName, handler);
  }

  /**
   * Dispatches a command to its registered handler.
   */
  public async dispatch<TCommand extends ICommand, TResult = any>(
    command: TCommand
  ): Promise<Result<TResult>> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName);

    if (!handler) {
      logger.error(`[CommandBus] No command handler registered for command: ${commandName}`);
      return { success: false, error: `Command handler not found for: ${commandName}` };
    }

    logger.info(`[CommandBus] Executing command: ${commandName}`);
    try {
      return await handler.execute(command);
    } catch (err: any) {
      logger.error(`[CommandBus] Failed executing command ${commandName}`, err);
      return { success: false, error: err.message };
    }
  }
}

/**
 * Query Bus resolving and executing query handlers.
 */
export class QueryBus {
  private handlers = new Map<string, IQueryHandler<any, any>>();

  /**
   * Registers a query handler.
   */
  public register<TQuery extends IQuery>(
    queryName: string,
    handler: IQueryHandler<TQuery>
  ): void {
    this.handlers.set(queryName, handler);
  }

  /**
   * Dispatches a query to its registered handler.
   */
  public async dispatch<TQuery extends IQuery, TResult = any>(
    query: TQuery
  ): Promise<Result<TResult>> {
    const queryName = query.constructor.name;
    const handler = this.handlers.get(queryName);

    if (!handler) {
      logger.error(`[QueryBus] No query handler registered for query: ${queryName}`);
      return { success: false, error: `Query handler not found for: ${queryName}` };
    }

    logger.info(`[QueryBus] Executing query: ${queryName}`);
    try {
      return await handler.execute(query);
    } catch (err: any) {
      logger.error(`[QueryBus] Failed executing query ${queryName}`, err);
      return { success: false, error: err.message };
    }
  }
}

export const commandBus = new CommandBus();
export const queryBus = new QueryBus();
export default { commandBus, queryBus };
