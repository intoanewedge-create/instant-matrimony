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
      let resolvedCountryId = countryId;
      if (countryId) {
        const country = await prisma.masterCountry.findFirst({
          where: { OR: [{ id: countryId }, { name: { equals: countryId, mode: "insensitive" } }] },
        });
        if (country) resolvedCountryId = country.id;
      }

      const items = await prisma.masterState.findMany({
        where: resolvedCountryId ? { countryId: resolvedCountryId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "STATES_FETCH_ERROR");
    }
  }

  async getDistricts(stateId?: string): Promise<Result<any[]>> {
    try {
      let resolvedStateId = stateId;
      if (stateId) {
        const state = await prisma.masterState.findFirst({
          where: { OR: [{ id: stateId }, { name: { equals: stateId, mode: "insensitive" } }] },
        });
        if (state) resolvedStateId = state.id;
      }

      const items = await prisma.masterDistrict.findMany({
        where: resolvedStateId ? { stateId: resolvedStateId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "DISTRICTS_FETCH_ERROR");
    }
  }

  async getCities(districtId?: string): Promise<Result<any[]>> {
    try {
      let resolvedDistrictId = districtId;
      if (districtId) {
        const district = await prisma.masterDistrict.findFirst({
          where: { OR: [{ id: districtId }, { name: { equals: districtId, mode: "insensitive" } }] },
        });
        if (district) resolvedDistrictId = district.id;
      }

      const items = await prisma.masterCity.findMany({
        where: resolvedDistrictId ? { districtId: resolvedDistrictId } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
      return this.returnSuccess(items);
    } catch (e: any) {
      return this.returnFailure(e.message, "CITIES_FETCH_ERROR");
    }
  }
}

export const masterDataService = new MasterDataService();

