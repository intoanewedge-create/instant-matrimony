import { SearchContext } from "../../domain/contracts";

export class Tokenizer {
  process(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  }
}

export class SpellCorrector {
  private corrections: Record<string, string> = {
    banglore: "bangalore",
    mumbay: "mumbai",
    delhy: "delhi",
    chenay: "chennai",
    kolkataa: "kolkata",
    engneer: "engineer",
    docctor: "doctor",
    religon: "religion",
  };

  process(tokens: string[]): string[] {
    return tokens.map((t) => this.corrections[t] || t);
  }
}

export class SynonymResolver {
  private synonyms: Record<string, string> = {
    developer: "software engineer",
    programmer: "software engineer",
    coder: "software engineer",
    physician: "doctor",
    surgeon: "doctor",
    mba: "postgraduate",
    techie: "software engineer",
  };

  process(tokens: string[]): string[] {
    const text = tokens.join(" ");
    let resolved = text;
    for (const [syn, standard] of Object.entries(this.synonyms)) {
      resolved = resolved.replace(new RegExp(`\\b${syn}\\b`, "g"), standard);
    }
    return resolved.split(" ");
  }
}

export class QueryNormalizer {
  private stopWords = new Set(["looking", "for", "in", "from", "a", "an", "the", "with", "who", "is", "are", "of"]);

  process(tokens: string[]): string[] {
    return tokens.filter((t) => !this.stopWords.has(t));
  }
}

export class IntentDetector {
  process(tokens: string[]): { isPremiumSearch: boolean; isVerifiedSearch: boolean } {
    const text = tokens.join(" ");
    return {
      isPremiumSearch: text.includes("premium") || text.includes("vip") || text.includes("paid"),
      isVerifiedSearch: text.includes("verified") || text.includes("checked") || text.includes("approved"),
    };
  }
}

export class EntityExtractor {
  private cities = ["bangalore", "mumbai", "delhi", "chennai", "hyderabad", "pune", "kolkata", "noida", "gurgaon"];
  private religions = ["hindu", "muslim", "christian", "sikh", "buddhist", "jain"];
  private occupations = ["software engineer", "doctor", "lawyer", "teacher", "manager", "designer", "consultant"];
  private genders = {
    male: ["male", "man", "guy", "boy", "groom"],
    female: ["female", "woman", "girl", "bride"],
  };

  process(tokens: string[]): {
    gender?: string;
    city?: string;
    religion?: string;
    occupation?: string;
    minAge?: number;
    maxAge?: number;
  } {
    const text = tokens.join(" ");
    const result: any = {};

    // 1. Gender
    for (const [gender, words] of Object.entries(this.genders)) {
      if (words.some((w) => text.includes(w))) {
        result.gender = gender.toUpperCase();
        break;
      }
    }

    // 2. City
    for (const city of this.cities) {
      if (text.includes(city)) {
        result.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // 3. Religion
    for (const rel of this.religions) {
      if (text.includes(rel)) {
        result.religion = rel.toUpperCase();
        break;
      }
    }

    // 4. Occupation
    for (const occ of this.occupations) {
      if (text.includes(occ)) {
        result.occupation = occ.toUpperCase().replace(" ", "_");
        break;
      }
    }

    // 5. Age range regex: e.g. age 25-30, 25 to 30
    const ageRangeRegex = /\b(\d{2})[-.\s]*(?:to|and)?[-.\s]*(\d{2})\b/;
    const match = text.match(ageRangeRegex);
    if (match) {
      result.minAge = parseInt(match[1], 10);
      result.maxAge = parseInt(match[2], 10);
    } else {
      const singleAgeRegex = /\bage\s*(\d{2})\b/;
      const singleMatch = text.match(singleAgeRegex);
      if (singleMatch) {
        result.minAge = parseInt(singleMatch[1], 10) - 2;
        result.maxAge = parseInt(singleMatch[1], 10) + 2;
      }
    }

    return result;
  }
}

export class FilterMapper {
  map(
    entities: any,
    intents: { isPremiumSearch: boolean; isVerifiedSearch: boolean }
  ): SearchContext["filters"] {
    return {
      gender: entities.gender,
      minAge: entities.minAge,
      maxAge: entities.maxAge,
      religion: entities.religion,
      city: entities.city,
      occupation: entities.occupation,
      isPremium: intents.isPremiumSearch ? true : undefined,
      isVerified: intents.isVerifiedSearch ? true : undefined,
    };
  }
}

export class SearchQueryPipeline {
  private tokenizer = new Tokenizer();
  private spellCorrector = new SpellCorrector();
  private synonymResolver = new SynonymResolver();
  private normalizer = new QueryNormalizer();
  private intentDetector = new IntentDetector();
  private entityExtractor = new EntityExtractor();
  private filterMapper = new FilterMapper();

  parse(queryText: string): {
    filters: SearchContext["filters"];
    telemetry: Record<string, number>;
  } {
    const telemetry: Record<string, number> = {};

    const t0 = Date.now();
    const tokens0 = this.tokenizer.process(queryText);
    telemetry["Tokenizer"] = Date.now() - t0;

    const t1 = Date.now();
    const tokens1 = this.spellCorrector.process(tokens0);
    telemetry["SpellCorrector"] = Date.now() - t1;

    const t2 = Date.now();
    const tokens2 = this.synonymResolver.process(tokens1);
    telemetry["SynonymResolver"] = Date.now() - t2;

    const t3 = Date.now();
    const tokens3 = this.normalizer.process(tokens2);
    telemetry["QueryNormalizer"] = Date.now() - t3;

    const t4 = Date.now();
    const intents = this.intentDetector.process(tokens3);
    telemetry["IntentDetector"] = Date.now() - t4;

    const t5 = Date.now();
    const entities = this.entityExtractor.process(tokens3);
    telemetry["EntityExtractor"] = Date.now() - t5;

    const t6 = Date.now();
    const filters = this.filterMapper.map(entities, intents);
    telemetry["FilterMapper"] = Date.now() - t6;

    return { filters, telemetry };
  }
}
