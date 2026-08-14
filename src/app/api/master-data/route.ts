import { NextRequest, NextResponse } from "next/server";
import { masterDataService } from "@/lib/services/master-data.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId") || searchParams.get("religionId") || searchParams.get("casteId") || searchParams.get("countryId") || searchParams.get("stateId");

  try {
    switch (type) {
      case "religions": {
        const res = await masterDataService.getReligions();
        return NextResponse.json(res);
      }
      case "castes": {
        const res = await masterDataService.getCastes(parentId || undefined);
        return NextResponse.json(res);
      }
      case "subcastes": {
        const res = await masterDataService.getSubCastes(parentId || undefined);
        return NextResponse.json(res);
      }
      case "gothrams": {
        const res = await masterDataService.getGothrams(parentId || undefined);
        return NextResponse.json(res);
      }
      case "mothertongues": {
        const res = await masterDataService.getMotherTongues();
        return NextResponse.json(res);
      }
      case "educations": {
        const res = await masterDataService.getEducations();
        return NextResponse.json(res);
      }
      case "occupations": {
        const res = await masterDataService.getOccupations();
        return NextResponse.json(res);
      }
      case "countries": {
        const res = await masterDataService.getCountries();
        return NextResponse.json(res);
      }
      case "states": {
        const res = await masterDataService.getStates(parentId || undefined);
        return NextResponse.json(res);
      }
      case "districts": {
        const res = await masterDataService.getDistricts(parentId || undefined);
        return NextResponse.json(res);
      }
      case "cities": {
        const res = await masterDataService.getCities(parentId || undefined);
        return NextResponse.json(res);
      }
      default:
        return NextResponse.json({ success: false, error: "Invalid master data type" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
