import {
  IAIFeedbackRepository,
  IFeatureStoreRepository,
  IModelRegistryRepository,
  IEmbeddingRepository,
  IDataCatalogRepository,
  IReportSnapshotRepository,
  IRuleRepository,
  IExperimentRepository,
  IAlertRepository,
  IKnowledgeRepository
} from "../interfaces/phase5-repositories.interface";
import {
  RecommendationFeedback,
  FeatureVector,
  ModelDeployment,
  ContentEmbedding,
  DataClassification,
  ReportSnapshot,
  PlatformPolicy,
  RecommendationExperiment,
  AlertIncident,
  KnowledgeArticle
} from "../../domain/phase5-contracts";

export class InMemoryAIFeedbackRepository implements IAIFeedbackRepository {
  private items: RecommendationFeedback[] = [];

  async create(feedback: RecommendationFeedback): Promise<RecommendationFeedback> {
    this.items.push(feedback);
    return feedback;
  }

  async findById(id: string): Promise<RecommendationFeedback | null> {
    return this.items.find(x => x.predictionId === id) || null;
  }

  async listByUserId(userId: string): Promise<RecommendationFeedback[]> {
    return this.items.filter(x => x.userId === userId);
  }
}

export class InMemoryFeatureStoreRepository implements IFeatureStoreRepository {
  private items: FeatureVector[] = [];

  async save(vector: FeatureVector): Promise<FeatureVector> {
    this.items = this.items.filter(x => !(x.userId === vector.userId && x.version === vector.version));
    this.items.push(vector);
    return vector;
  }

  async findByUserId(userId: string, version?: string): Promise<FeatureVector | null> {
    if (version) {
      return this.items.find(x => x.userId === userId && x.version === version) || null;
    }
    const filtered = this.items.filter(x => x.userId === userId);
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
}

export class InMemoryModelRegistryRepository implements IModelRegistryRepository {
  private items: ModelDeployment[] = [];

  async register(deployment: ModelDeployment): Promise<ModelDeployment> {
    this.items.push(deployment);
    return deployment;
  }

  async findById(deploymentId: string): Promise<ModelDeployment | null> {
    return this.items.find(x => x.deploymentId === deploymentId) || null;
  }

  async listAll(): Promise<ModelDeployment[]> {
    return this.items;
  }

  async updateStatus(deploymentId: string, status: ModelDeployment["status"]): Promise<ModelDeployment> {
    const item = this.items.find(x => x.deploymentId === deploymentId);
    if (!item) throw new Error("Deployment not found");
    item.status = status;
    return item;
  }
}

export class InMemoryEmbeddingRepository implements IEmbeddingRepository {
  private items: ContentEmbedding[] = [];

  async save(embedding: ContentEmbedding): Promise<ContentEmbedding> {
    this.items.push(embedding);
    return embedding;
  }

  async findById(id: string): Promise<ContentEmbedding | null> {
    return this.items.find(x => x.id === id) || null;
  }

  async findNearest(vector: number[], limit: number): Promise<ContentEmbedding[]> {
    // Simple Euclidean distance heuristic for testing
    return this.items
      .map(item => {
        let dist = 0;
        for (let i = 0; i < Math.min(vector.length, item.vector.length); i++) {
          dist += Math.pow(vector[i] - item.vector[i], 2);
        }
        return { item, score: 1 / (1 + Math.sqrt(dist)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.item);
  }
}

export class InMemoryDataCatalogRepository implements IDataCatalogRepository {
  private items: DataClassification[] = [];

  async saveClassification(classification: DataClassification): Promise<DataClassification> {
    this.items = this.items.filter(x => !(x.tableName === classification.tableName && x.columnName === classification.columnName));
    this.items.push(classification);
    return classification;
  }

  async getClassification(tableName: string, columnName: string): Promise<DataClassification | null> {
    return this.items.find(x => x.tableName === tableName && x.columnName === columnName) || null;
  }

  async listAllClassifications(): Promise<DataClassification[]> {
    return this.items;
  }
}

export class InMemoryReportSnapshotRepository implements IReportSnapshotRepository {
  private items: ReportSnapshot[] = [];

  async save(snapshot: ReportSnapshot): Promise<ReportSnapshot> {
    this.items.push(snapshot);
    return snapshot;
  }

  async findById(snapshotId: string): Promise<ReportSnapshot | null> {
    return this.items.find(x => x.snapshotId === snapshotId) || null;
  }

  async listAll(): Promise<ReportSnapshot[]> {
    return this.items;
  }
}

export class InMemoryRuleRepository implements IRuleRepository {
  private items: PlatformPolicy[] = [];

  async savePolicy(policy: PlatformPolicy): Promise<PlatformPolicy> {
    this.items = this.items.filter(x => x.policyId !== policy.policyId);
    this.items.push(policy);
    return policy;
  }

  async findPolicyById(policyId: string): Promise<PlatformPolicy | null> {
    return this.items.find(x => x.policyId === policyId) || null;
  }

  async listPolicies(): Promise<PlatformPolicy[]> {
    return this.items;
  }
}

export class InMemoryExperimentRepository implements IExperimentRepository {
  private items: RecommendationExperiment[] = [];

  async saveExperiment(experiment: RecommendationExperiment): Promise<RecommendationExperiment> {
    this.items = this.items.filter(x => x.experimentId !== experiment.experimentId);
    this.items.push(experiment);
    return experiment;
  }

  async findExperimentById(experimentId: string): Promise<RecommendationExperiment | null> {
    return this.items.find(x => x.experimentId === experimentId) || null;
  }

  async listExperiments(): Promise<RecommendationExperiment[]> {
    return this.items;
  }
}

export class InMemoryAlertRepository implements IAlertRepository {
  private items: AlertIncident[] = [];

  async saveIncident(incident: AlertIncident): Promise<AlertIncident> {
    this.items = this.items.filter(x => x.incidentId !== incident.incidentId);
    this.items.push(incident);
    return incident;
  }

  async findIncidentById(incidentId: string): Promise<AlertIncident | null> {
    return this.items.find(x => x.incidentId === incidentId) || null;
  }

  async listIncidents(): Promise<AlertIncident[]> {
    return this.items;
  }
}

export class InMemoryKnowledgeRepository implements IKnowledgeRepository {
  private items: KnowledgeArticle[] = [];

  async saveArticle(article: KnowledgeArticle): Promise<KnowledgeArticle> {
    this.items = this.items.filter(x => x.articleId !== article.articleId);
    this.items.push(article);
    return article;
  }

  async findArticleById(articleId: string): Promise<KnowledgeArticle | null> {
    return this.items.find(x => x.articleId === articleId) || null;
  }

  async listArticles(): Promise<KnowledgeArticle[]> {
    return this.items;
  }
}
