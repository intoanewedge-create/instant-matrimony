import assert from "assert";
import {
  tenantService,
  tenantBillingService,
  tenantMigrationService,
  encryptionService,
  disasterRecoveryService,
  aiPlatformService,
  aiOrchestrationService,
  embeddingService,
  promptRegistryService,
  modelRegistryService,
  aiEvaluationService,
  featureStoreService,
  governanceService,
  dataCatalogService,
  ruleEngineService,
  decisionEngineService,
  policyEngineService,
  dataQualityService,
  reportBuilderService,
  dashboardEngineService,
  forecastingService,
  capacityPlanningService,
  costManagementService,
  saasMetricsService,
  securityIntelligenceService,
  identityService,
  webAuthnService,
  mfaService,
  sessionRiskService,
  authorizationService,
  policyEvaluatorService,
  operationsAutomationService,
  pluginService,
  agentPlatformService,
  reliabilityService,
  developerPlatformService,
  eventStore
} from "../container";
import {
  SnapshotStore,
  AggregateRebuilder,
  ProjectionEngine,
  ReplayEngine
} from "../events/event-sourcing";

async function runTests() {
  console.log("=== Starting Phase 5 Enterprise Platform Integration Tests ===");

  // 1. Multi-Tenant SaaS Foundation
  console.log("Testing Multi-Tenant SaaS Foundation...");
  const onboardRes = await tenantService.onboardTenant("us_corp", "US Corporate", { api_requests: 1000 });
  assert.ok(onboardRes.success, "Tenant onboarding failed");
  assert.equal(onboardRes.data!.tenantId, "us_corp");

  const checkQuota1 = await tenantService.checkQuota("us_corp", "api_requests", 500);
  assert.ok(checkQuota1.success && checkQuota1.data === true, "Quota validation failed");

  const checkQuota2 = await tenantService.checkQuota("us_corp", "api_requests", 1500);
  assert.ok(checkQuota2.success && checkQuota2.data === false, "Quota breach check failed");

  const billRes = await tenantBillingService.calculateTenantBill("us_corp", { ai_tokens: 50000, api_requests: 800 });
  assert.ok(billRes.success && billRes.data!.totalCost > 0, "Billing calculation failed");

  const exportRes = await tenantMigrationService.exportTenantData("us_corp");
  assert.ok(exportRes.success && exportRes.data!.includes("us_corp"), "Tenant migration export failed");

  // 2. Event Sourcing & CQRS
  console.log("Testing Event Sourcing & CQRS...");
  const snapStore = new SnapshotStore();
  await snapStore.save("stream_1", { count: 10 }, 1);
  const snap = await snapStore.get("stream_1");
  assert.ok(snap && snap.version === 1 && snap.state.count === 10, "SnapshotStore retrieval failed");

  // 3. KMS Envelope Encryption
  console.log("Testing KMS Envelope Encryption...");
  const plainText = "SecretPIIData";
  const encryptRes = await encryptionService.encryptField(plainText);
  assert.ok(encryptRes.success, "KMS Encryption failed");
  
  const decryptRes = await encryptionService.decryptField(encryptRes.data!.ciphertext);
  assert.ok(decryptRes.success && decryptRes.data! === plainText, "KMS Decryption failed");

  const tokenRes = await encryptionService.tokenize("hello@gmail.com");
  assert.ok(tokenRes.success && tokenRes.data!.startsWith("TOK_"), "PII Tokenization failed");

  // 4. Disaster Recovery
  console.log("Testing Disaster Recovery...");
  const drRes = await disasterRecoveryService.runRestoreVerification();
  assert.ok(drRes.success && drRes.data!.integrityPassed, "DR restore drill failed");

  // 5. AI Platform & Prompt/Model/Embedding MLOps
  console.log("Testing MLOps & AI Platform...");
  const promptRes = await promptRegistryService.registerPrompt("welcome_bot", "Welcome Prompt", "Hello {{name}}", "v1.0.0");
  assert.ok(promptRes.success, "Prompt registration failed");

  const approvePromptRes = await promptRegistryService.approvePrompt("welcome_bot", "v1.0.0");
  assert.ok(approvePromptRes.success && approvePromptRes.data!.approved, "Prompt approval failed");

  const aiInference = await aiOrchestrationService.routeRequest("Short prompt", "COST");
  assert.ok(aiInference.success && aiInference.data!.confidenceScore > 0.9, "AI Orchestration failed");

  const modelDeploy = await modelRegistryService.deployModel("matcher_net", "v2.1.0", "ACTIVE");
  assert.ok(modelDeploy.success && modelDeploy.data!.version === "v2.1.0", "Model deploy failed");

  const driftReport = await modelRegistryService.calculateDrift("matcher_net", "v2.1.0");
  assert.ok(driftReport.success, "Drift computation failed");

  const embedRes = await embeddingService.getOrCreateEmbedding("text_1", "Matchmaker candidate profile");
  assert.ok(embedRes.success && embedRes.data!.vector.length === 1536, "Embedding generation failed");

  const similarRes = await embeddingService.findSimilarContent("Query", 3);
  assert.ok(similarRes.success, "Semantic vector search failed");

  // 6. Governance, Policy & Data Quality
  console.log("Testing Governance, Policy & Data Quality...");
  const catalogRes = await dataCatalogService.classifyField("User", "email", "PII", "compliance_officer");
  assert.ok(catalogRes.success, "Data Catalog classification failed");

  await ruleEngineService.saveRule("policy_age", "Adult Check", "age < 18", "DENY");
  const decisionRes = await decisionEngineService.decideAction("user_123", ["policy_age"], { age: 12 });
  assert.ok(decisionRes.success && !decisionRes.data!.allowed, "Policy deny rule failed to block underage action");

  const dqRes = await dataQualityService.validateDataset("Profile", [{ id: "p1", name: "Alice" }, { id: null, name: "Bob" }]);
  assert.ok(dqRes.success && dqRes.data!.integrityScore === 50, "Data Quality assessment failed");

  // 7. Reporting & SaaS Metrics
  console.log("Testing Reporting & SaaS Metrics...");
  const reportRes = await reportBuilderService.buildSnapshot("finance_q3", [{ revenue: 45000 }], "admin_user");
  assert.ok(reportRes.success, "Report snapshot building failed");

  const verifyReport = await reportBuilderService.verifySnapshot(reportRes.data!.snapshotId);
  assert.ok(verifyReport.success && verifyReport.data! === true, "Report reproducibility verification failed");

  const saasSnap = await saasMetricsService.generateSnapshot(150, 49.99, 1200, 10);
  assert.ok(saasSnap.success && saasSnap.data!.arr > 0, "SaaS MRR/ARR Snapshot metrics failed");

  // 8. Security Intelligence & Auth
  console.log("Testing Security Intelligence & Identity Platform...");
  const riskAssessment = await securityIntelligenceService.assessRisk("user_99", "fingerprint_xyz", "192.168.99.12");
  assert.ok(riskAssessment.success && riskAssessment.data!.riskScore > 40, "Security risk scoring check failed");

  const impossibleTravel = await sessionRiskService.assessSessionRisk("user_99", "203.0.113.5", "IN");
  const impossibleTravelBreach = await sessionRiskService.assessSessionRisk("user_99", "198.51.100.12", "US");
  assert.ok(impossibleTravelBreach.success && impossibleTravelBreach.data!.riskScore === 95, "Session travel risk calculation failed");

  const tempAccess = await authorizationService.grantTemporaryAccess("user_99", ["ADMIN_DASHBOARD"], 10000);
  assert.ok(tempAccess.success, "Temporary access override grant failed");

  const authEval = await policyEvaluatorService.evaluateCachedPolicy("user_99", "ADMIN_DASHBOARD");
  assert.ok(authEval.success && authEval.data! === true, "Cached access verification failed");

  // 9. Operations Automation, Plugins & Agents
  console.log("Testing Operations, Plugins & Agents...");
  const healRes = await operationsAutomationService.healStuckQueues();
  assert.ok(healRes.success && healRes.data!.processedCount > 0, "Automation stuck queue self-healing failed");

  const myPlugin = {
    id: "my_plug",
    name: "Custom Exporter",
    enabled: true,
    permissions: ["READ"],
    execute: async (ctx: any) => "Plugin Result"
  };
  await pluginService.registerPlugin(myPlugin);
  const pluginExec = await pluginService.executePlugin("my_plug", { userRoles: ["USER"] });
  assert.ok(pluginExec.success && pluginExec.data! === "Plugin Result", "Sandbox plugin execution failed");

  const agentRes = await agentPlatformService.runTaskWithReflection("user_1", "Optimize partner recommendations");
  assert.ok(agentRes.success && agentRes.data!.stepsExecuted.includes("SELF_REFLECTION"), "Agent self-reflection steps failed");

  const relRes = await reliabilityService.calculateMetrics(720);
  assert.ok(relRes.success && relRes.data!.availability === 100, "Reliability score calculation failed");

  const devHub = await developerPlatformService.generateSdkArtifacts();
  assert.ok(devHub.success && devHub.data!.typescriptSdk.includes("InstantMatrimonyClient"), "Developer hub SDK generation failed");

  console.log("=== All Phase 5 Enterprise Platform Integration Tests Passed Successfully ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
