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

export interface IAIFeedbackRepository {
  create(feedback: RecommendationFeedback): Promise<RecommendationFeedback>;
  findById(id: string): Promise<RecommendationFeedback | null>;
  listByUserId(userId: string): Promise<RecommendationFeedback[]>;
}

export interface IFeatureStoreRepository {
  save(vector: FeatureVector): Promise<FeatureVector>;
  findByUserId(userId: string, version?: string): Promise<FeatureVector | null>;
}

export interface IModelRegistryRepository {
  register(deployment: ModelDeployment): Promise<ModelDeployment>;
  findById(deploymentId: string): Promise<ModelDeployment | null>;
  listAll(): Promise<ModelDeployment[]>;
  updateStatus(deploymentId: string, status: ModelDeployment["status"]): Promise<ModelDeployment>;
}

export interface IEmbeddingRepository {
  save(embedding: ContentEmbedding): Promise<ContentEmbedding>;
  findById(id: string): Promise<ContentEmbedding | null>;
  findNearest(vector: number[], limit: number): Promise<ContentEmbedding[]>;
}

export interface IDataCatalogRepository {
  saveClassification(classification: DataClassification): Promise<DataClassification>;
  getClassification(tableName: string, columnName: string): Promise<DataClassification | null>;
  listAllClassifications(): Promise<DataClassification[]>;
}

export interface IReportSnapshotRepository {
  save(snapshot: ReportSnapshot): Promise<ReportSnapshot>;
  findById(snapshotId: string): Promise<ReportSnapshot | null>;
  listAll(): Promise<ReportSnapshot[]>;
}

export interface IRuleRepository {
  savePolicy(policy: PlatformPolicy): Promise<PlatformPolicy>;
  findPolicyById(policyId: string): Promise<PlatformPolicy | null>;
  listPolicies(): Promise<PlatformPolicy[]>;
}

export interface IExperimentRepository {
  saveExperiment(experiment: RecommendationExperiment): Promise<RecommendationExperiment>;
  findExperimentById(experimentId: string): Promise<RecommendationExperiment | null>;
  listExperiments(): Promise<RecommendationExperiment[]>;
}

export interface IAlertRepository {
  saveIncident(incident: AlertIncident): Promise<AlertIncident>;
  findIncidentById(incidentId: string): Promise<AlertIncident | null>;
  listIncidents(): Promise<AlertIncident[]>;
}

export interface IKnowledgeRepository {
  saveArticle(article: KnowledgeArticle): Promise<KnowledgeArticle>;
  findArticleById(articleId: string): Promise<KnowledgeArticle | null>;
  listArticles(): Promise<KnowledgeArticle[]>;
}
