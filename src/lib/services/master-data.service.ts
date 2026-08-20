import { prisma } from "../prisma";
import { BaseService } from "./base.service";
import { Result } from "../result";

export class MasterDataService extends BaseService {
  async getReligions(): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterReligion.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "RELIGIONS_FETCH_ERROR");
    }
  }

  async getCastes(religionId?: string): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterCaste.findMany({
        where: religionId ? { religionId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "CASTES_FETCH_ERROR");
    }
  }

  async getSubCastes(casteId?: string): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterSubCaste.findMany({
        where: casteId ? { casteId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "SUBCASTES_FETCH_ERROR");
    }
  }

  async getGothrams(subCasteId?: string): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterGothram.findMany({
        where: subCasteId ? { subCasteId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "GOTHRAMS_FETCH_ERROR");
    }
  }

  async getMotherTongues(): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterMotherTongue.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "MOTHER_TONGUES_FETCH_ERROR");
    }
  }

  async getEducations(): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterEducation.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "EDUCATIONS_FETCH_ERROR");
    }
  }

  async getOccupations(): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterOccupation.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "OCCUPATIONS_FETCH_ERROR");
    }
  }

  async getCountries(): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterCountry.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "COUNTRIES_FETCH_ERROR");
    }
  }

  async getStates(countryId?: string): Promise<Result<any[]>> {
    try {
      const items = await prisma.masterState.findMany({
        where: countryId ? { countryId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      if (items.length > 0) {
        return this.returnSuccess(items);
      }
      // Fallback from locations dataset
      const fallbackStates = [
        { id: "ap", name: "Andhra Pradesh" },
        { id: "tg", name: "Telangana" },
        { id: "ka", name: "Karnataka" },
        { id: "tn", name: "Tamil Nadu" },
        { id: "mh", name: "Maharashtra" },
        { id: "dl", name: "Delhi NCR" },
        { id: "kl", name: "Kerala" },
        { id: "gj", name: "Gujarat" },
        { id: "up", name: "Uttar Pradesh" },
        { id: "wb", name: "West Bengal" },
      ];
      return this.returnSuccess(fallbackStates);
    } catch (e: any) {
      return this.returnFailure(e.message, "STATES_FETCH_ERROR");
    }
  }

  async getDistricts(stateId?: string): Promise<Result<any[]>> {
    try {
      if (stateId) {
        const items = await prisma.masterDistrict.findMany({
          where: {
            OR: [
              { stateId },
              { state: { name: { equals: stateId, mode: "insensitive" } } },
            ],
          },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        });
        if (items.length > 0) {
          return this.returnSuccess(items);
        }
      }

      // Check fallback location hierarchy
      const { INDIAN_LOCATION_DATA } = await import("../constants/locations");
      const matched = INDIAN_LOCATION_DATA.find(
        (s) =>
          s.state.toLowerCase() === (stateId || "").toLowerCase() ||
          s.state.toLowerCase().includes((stateId || "").toLowerCase())
      );
      if (matched) {
        const mapped = matched.districts.map((d, idx) => ({
          id: `${matched.state.toLowerCase()}-${idx}`,
          name: d.name,
        }));
        return this.returnSuccess(mapped);
      }

      return this.returnSuccess([]);
    } catch (e: any) {
      return this.returnFailure(e.message, "DISTRICTS_FETCH_ERROR");
    }
  }

  async getCities(districtId?: string): Promise<Result<any[]>> {
    try {
      if (districtId) {
        const items = await prisma.masterCity.findMany({
          where: {
            OR: [
              { districtId },
              { district: { name: { equals: districtId, mode: "insensitive" } } },
            ],
          },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        });
        if (items.length > 0) {
          return this.returnSuccess(items);
        }
      }

      // Check fallback location hierarchy
      const { INDIAN_LOCATION_DATA } = await import("../constants/locations");
      for (const st of INDIAN_LOCATION_DATA) {
        const d = st.districts.find(
          (dis) =>
            dis.name.toLowerCase() === (districtId || "").toLowerCase() ||
            dis.name.toLowerCase().includes((districtId || "").toLowerCase())
        );
        if (d) {
          const mapped = d.cities.map((c, idx) => ({
            id: `${d.name.toLowerCase()}-${idx}`,
            name: c,
          }));
          return this.returnSuccess(mapped);
        }
      }

      return this.returnSuccess([]);
    } catch (e: any) {
      return this.returnFailure(e.message, "CITIES_FETCH_ERROR");
    }
  }

  // ─── Admin CRUD Operations ────────────────────────────────────────

  private getModel(category: string): any {
    const map: Record<string, any> = {
      religions: prisma.masterReligion,
      castes: prisma.masterCaste,
      mothertongues: prisma.masterMotherTongue,
      educations: prisma.masterEducation,
      occupations: prisma.masterOccupation,
      countries: prisma.masterCountry,
      states: prisma.masterState,
    };
    return map[category] || null;
  }

  async createEntry(category: string, data: { name: string; order?: number; code?: string; category?: string; parentId?: string }): Promise<Result<any>> {
    try {
      const model = this.getModel(category);
      if (!model) return this.returnFailure("Invalid category", "INVALID_CATEGORY");

      const createData: any = { name: data.name, order: data.order ?? 0 };
      if (data.code) createData.code = data.code;
      if (data.category) createData.category = data.category;

      // Handle parent relationships
      if (category === "castes" && data.parentId) createData.religionId = data.parentId;
      if (category === "states" && data.parentId) createData.countryId = data.parentId;

      const item = await model.create({ data: createData });
      return this.returnSuccess(item);
    } catch (e: any) {
      return this.returnFailure(e.message, "MASTER_DATA_CREATE_ERROR");
    }
  }

  async updateEntry(category: string, id: string, data: { name?: string; order?: number; code?: string; category?: string }): Promise<Result<any>> {
    try {
      const model = this.getModel(category);
      if (!model) return this.returnFailure("Invalid category", "INVALID_CATEGORY");

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.code !== undefined) updateData.code = data.code;
      if (data.category !== undefined) updateData.category = data.category;

      const item = await model.update({ where: { id }, data: updateData });
      return this.returnSuccess(item);
    } catch (e: any) {
      return this.returnFailure(e.message, "MASTER_DATA_UPDATE_ERROR");
    }
  }

  async deleteEntry(category: string, id: string): Promise<Result<boolean>> {
    try {
      const model = this.getModel(category);
      if (!model) return this.returnFailure("Invalid category", "INVALID_CATEGORY");

      await model.delete({ where: { id } });
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "MASTER_DATA_DELETE_ERROR");
    }
  }
}

export const masterDataService = new MasterDataService();

