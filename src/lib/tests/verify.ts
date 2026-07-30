import { aiProviderRegistry } from "../ai/ai-provider-registry";
import { SearchQueryPipeline } from "../search/pipeline/search-query-pipeline";
import { SearchRankingService } from "../services/search-ranking.service";
import { CompatibilityService } from "../services/compatibility.service";
import { NotificationDispatcher } from "../notifications/pipeline/notification-pipeline";
import { MockNotificationProvider } from "../notifications/providers/mock-notification-provider";
import { RecommendationPipeline } from "../recommendation/pipeline/recommendation-pipeline";
import { RuleBasedMatchExplanationProvider } from "../recommendation/rule-based-match-explanation-provider";
import { UserProfile } from "../domain/contracts";

async function runTests() {
  console.log("=========================================");
  console.log("STARTING INSTANTMATRIMONY VERIFICATION SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: AI Provider Registry fallback and capabilities
  try {
    console.log("--- Test 1: AI Provider Registry & Fallback ---");
    const activeProvider = await aiProviderRegistry.getActiveProvider();
    assert(activeProvider !== null, "Resolved active AI provider");
    assert(activeProvider.providerName() === "RuleBasedAiProvider", "Fell back successfully to RuleBasedAiProvider");
    assert(activeProvider.supportsChat() === true, "RuleBasedAi supports chat");
    assert(activeProvider.supportsVision() === false, "RuleBasedAi does not support vision");
  } catch (e: any) {
    assert(false, `Test 1 failed with error: ${e.message}`);
  }

  // TEST 2: NLP Search Query Parsing
  try {
    console.log("\n--- Test 2: Search NLP Query Understanding ---");
    const nlp = new SearchQueryPipeline();
    
    const testQuery1 = "software engineer from bangalore";
    const result1 = nlp.parse(testQuery1);
    assert(result1.filters.occupation === "SOFTWARE_ENGINEER", "Extracted SOFTWARE_ENGINEER occupation");
    assert(result1.filters.city === "Bangalore", "Extracted Bangalore city");

    const testQuery2 = "looking for a doctor in Mumbai";
    const result2 = nlp.parse(testQuery2);
    assert(result2.filters.occupation === "DOCTOR", "Extracted DOCTOR occupation");
    assert(result2.filters.city === "Mumbai", "Extracted Mumbai city");

    const testQuery3 = "looking for a hindu match";
    const result3 = nlp.parse(testQuery3);
    assert(result3.filters.religion === "HINDU", "Extracted HINDU religion");
  } catch (e: any) {
    assert(false, `Test 2 failed with error: ${e.message}`);
  }

  // TEST 3: Search Ranking & Boosts
  try {
    console.log("\n--- Test 3: Search Ranking & Scoring Boosts ---");
    const compService = new CompatibilityService();
    const ranker = new SearchRankingService(compService);

    const viewer: any = {
      id: "v1",
      userId: "u1",
      name: "Viewer",
      gender: "MALE",
      religion: "HINDU",
      caste: "Brahmin",
      motherTongue: "Hindi",
      maritalStatus: "NEVER_MARRIED",
      dateOfBirth: new Date("1995-01-01"),
      height: 175,
      country: "India",
      state: "Karnataka",
      city: "Bangalore",
      education: "BTech",
      occupation: "SOFTWARE_ENGINEER",
      income: 1500000,
      completionPercent: 90,
      partnerPreference: null,
    };

    const candidate1 = {
      id: "c1",
      userId: "uc1",
      name: "Candidate 1",
      gender: "FEMALE",
      religion: "HINDU",
      caste: "Brahmin",
      motherTongue: "Hindi",
      maritalStatus: "NEVER_MARRIED",
      dateOfBirth: new Date("1997-01-01"),
      height: 165,
      country: "India",
      state: "Karnataka",
      city: "Bangalore",
      education: "MTech",
      occupation: "SOFTWARE_ENGINEER",
      income: 1200000,
      completionPercent: 85,
      user: {
        identityVerification: { status: "APPROVED" },
        memberships: [{ status: "ACTIVE", endDate: new Date("2026-12-31") }],
      },
    };

    const ranked = ranker.rankCandidates(viewer, [candidate1 as any]);
    assert(ranked.length === 1, "Ranked 1 candidate");
    assert(ranked[0].rankingScore > 80, `Premium + Verified boosts applied: score is ${ranked[0].rankingScore}`);
  } catch (e: any) {
    assert(false, `Test 3 failed with error: ${e.message}`);
  }

  // TEST 4: Recommendation Pipeline Execution
  try {
    console.log("\n--- Test 4: Recommendation Pipeline Execution ---");
    // Mock Collector
    const mockCollector = {
      async collect() {
        return [];
      }
    };
    const mockFilter = {
      async filter() {
        return [];
      }
    };
    const mockScorer = {
      async score() {
        return [];
      }
    };
    const mockRanker = {
      async rank(scored: any[]) {
        return scored;
      }
    };
    const mockBehaviorService = {
      async getBehaviorContext() {
        return {
          clickCount: 0,
          clickedReligions: {},
          clickedCastes: {},
          clickedOccupations: {},
          clickedCities: {},
        };
      }
    };
    const mockExplanation = new RuleBasedMatchExplanationProvider();

    const pipeline = new RecommendationPipeline(
      mockCollector as any,
      mockFilter as any,
      mockScorer as any,
      mockBehaviorService as any,
      mockRanker as any,
      mockExplanation as any
    );

    assert(pipeline !== null, "Instantiated recommendation pipeline");
  } catch (e: any) {
    assert(false, `Test 4 failed with error: ${e.message}`);
  }

  // TEST 5: Notification Delivery Pipeline Preferences
  try {
    console.log("\n--- Test 5: Notification Delivery & Preferences ---");
    const mockProvider = new MockNotificationProvider();
    const dispatcher = new NotificationDispatcher([mockProvider]);

    assert(dispatcher !== null, "Instantiated notification dispatcher");
    assert(mockProvider.name() === "MockNotificationProvider", "Identified MockNotificationProvider");
  } catch (e: any) {
    assert(false, `Test 5 failed with error: ${e.message}`);
  }

  console.log("\n=========================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================");
  
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
