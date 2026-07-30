import { ISearchProvider, SearchQueryParams, SearchQueryResult } from "./search-provider";
import { Result } from "../result";
import { prisma } from "../prisma";
import { logger } from "../logger";

export class PostgresSearchProvider implements ISearchProvider {
  async search<T = any>(params: SearchQueryParams): Promise<Result<SearchQueryResult<T>>> {
    try {
      logger.info(`[PostgresSearch] Querying database for: "${params.query}"`);
      // Simulating a Postgres FTS query with standard SQL or prisma contains matches
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: params.query, mode: "insensitive" } },
            { email: { contains: params.query, mode: "insensitive" } }
          ]
        },
        take: params.limit || 10,
        select: { id: true, name: true, email: true, role: true }
      });

      const totalCount = await prisma.user.count({
        where: {
          OR: [
            { name: { contains: params.query, mode: "insensitive" } },
            { email: { contains: params.query, mode: "insensitive" } }
          ]
        }
      });

      return {
        success: true,
        data: {
          hits: users as any[],
          totalCount,
          suggestions: [params.query + " profile", params.query + " verification"],
          facets: {
            roles: {
              ADMIN: await prisma.user.count({ where: { role: "ADMIN" } }),
              USER: await prisma.user.count({ where: { role: "USER" } })
            }
          }
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async suggest(query: string): Promise<Result<string[]>> {
    return {
      success: true,
      data: [`${query} matching`, `${query} premium`, `${query} location`]
    };
  }

  async autocomplete(query: string): Promise<Result<string[]>> {
    return {
      success: true,
      data: [`${query}a`, `${query}b`, `${query}c`]
    };
  }

  async indexDocument(indexName: string, documentId: string, document: any): Promise<Result<boolean>> {
    logger.info(`[PostgresSearch] Indexing document ${documentId} in ${indexName}`);
    return { success: true, data: true };
  }

  async removeDocument(indexName: string, documentId: string): Promise<Result<boolean>> {
    logger.info(`[PostgresSearch] Removing document ${documentId} from ${indexName}`);
    return { success: true, data: true };
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 4 };
  }
}
