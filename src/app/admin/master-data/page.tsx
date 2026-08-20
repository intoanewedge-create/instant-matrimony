import { masterDataService } from "@/lib/services/master-data.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Layers, Globe, GraduationCap, Briefcase, MapPin } from "lucide-react";
import { EditableMasterDataList } from "./editable-master-data-list";

export const dynamic = "force-dynamic";

export default async function AdminMasterDataPage() {
  const [
    religionsRes,
    castesRes,
    subCastesRes,
    gothramsRes,
    motherTonguesRes,
    educationsRes,
    occupationsRes,
    countriesRes,
    statesRes,
    districtsRes,
    citiesRes,
  ] = await Promise.all([
    masterDataService.getReligions(),
    masterDataService.getCastes(),
    masterDataService.getSubCastes(),
    masterDataService.getGothrams(),
    masterDataService.getMotherTongues(),
    masterDataService.getEducations(),
    masterDataService.getOccupations(),
    masterDataService.getCountries(),
    masterDataService.getStates(),
    masterDataService.getDistricts(),
    masterDataService.getCities(),
  ]);

  const religions = religionsRes.success && Array.isArray(religionsRes.data) ? religionsRes.data : [];
  const castes = castesRes.success && Array.isArray(castesRes.data) ? castesRes.data : [];
  const subCastes = subCastesRes.success && Array.isArray(subCastesRes.data) ? subCastesRes.data : [];
  const gothrams = gothramsRes.success && Array.isArray(gothramsRes.data) ? gothramsRes.data : [];
  const motherTongues = motherTonguesRes.success && Array.isArray(motherTonguesRes.data) ? motherTonguesRes.data : [];
  const educations = educationsRes.success && Array.isArray(educationsRes.data) ? educationsRes.data : [];
  const occupations = occupationsRes.success && Array.isArray(occupationsRes.data) ? occupationsRes.data : [];
  const countries = countriesRes.success && Array.isArray(countriesRes.data) ? countriesRes.data : [];
  const states = statesRes.success && Array.isArray(statesRes.data) ? statesRes.data : [];
  const districts = districtsRes.success && Array.isArray(districtsRes.data) ? districtsRes.data : [];
  const cities = citiesRes.success && Array.isArray(citiesRes.data) ? citiesRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Master Data Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage standardized demographic, caste, religious, and geographic taxonomies live in PostgreSQL.
          </p>
        </div>
      </div>

      <Tabs defaultValue="religions" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1.5 bg-slate-100 border border-slate-200 p-1.5 rounded-xl">
          <TabsTrigger value="religions" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" /> Religions ({religions.length})
          </TabsTrigger>
          <TabsTrigger value="castes" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" /> Castes ({castes.length})
          </TabsTrigger>
          <TabsTrigger value="subcastes" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" /> Sub-Castes ({subCastes.length})
          </TabsTrigger>
          <TabsTrigger value="gothrams" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" /> Gothrams ({gothrams.length})
          </TabsTrigger>
          <TabsTrigger value="languages" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Globe className="w-3.5 h-3.5 mr-1" /> Languages ({motherTongues.length})
          </TabsTrigger>
          <TabsTrigger value="educations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Education ({educations.length})
          </TabsTrigger>
          <TabsTrigger value="occupations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Briefcase className="w-3.5 h-3.5 mr-1" /> Professions ({occupations.length})
          </TabsTrigger>
          <TabsTrigger value="countries" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <Globe className="w-3.5 h-3.5 mr-1" /> Countries ({countries.length})
          </TabsTrigger>
          <TabsTrigger value="states" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1" /> States ({states.length})
          </TabsTrigger>
          <TabsTrigger value="districts" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1" /> Districts ({districts.length})
          </TabsTrigger>
          <TabsTrigger value="cities" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1" /> Cities ({cities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="religions" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" /> Religions
              </CardTitle>
              <CardDescription className="text-slate-500">
                Registered community and faith taxonomies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="religions"
                items={religions}
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="castes" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" /> Caste Classifications
              </CardTitle>
              <CardDescription className="text-slate-500">
                Categorized castes under parent religions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="castes"
                items={castes}
                parentItems={religions}
                parentLabel="Religion"
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcastes" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" /> Sub-Castes
              </CardTitle>
              <CardDescription className="text-slate-500">
                Sub-caste lineages under parent castes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="subcastes"
                items={subCastes}
                parentItems={castes}
                parentLabel="Caste"
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gothrams" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" /> Gothrams
              </CardTitle>
              <CardDescription className="text-slate-500">
                Ancestral gothram taxonomies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="gothrams"
                items={gothrams}
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-500" /> Mother Tongues
              </CardTitle>
              <CardDescription className="text-slate-500">
                Primary spoken languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="mothertongues"
                items={motherTongues}
                labelField="code"
                labelPrefix="Code"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="educations" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-rose-500" /> Education Degrees
              </CardTitle>
              <CardDescription className="text-slate-500">
                Standardized academic qualifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="educations"
                items={educations}
                labelField="category"
                labelPrefix="Type"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupations" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-rose-500" /> Professions &amp; Occupations
              </CardTitle>
              <CardDescription className="text-slate-500">
                Occupational careers and professions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="occupations"
                items={occupations}
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-500" /> Countries
              </CardTitle>
              <CardDescription className="text-slate-500">
                Global country locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="countries"
                items={countries}
                labelField="code"
                labelPrefix="ISO Code"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> States / Provinces
              </CardTitle>
              <CardDescription className="text-slate-500">
                Regional states under parent countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="states"
                items={states}
                parentItems={countries}
                parentLabel="Country"
                labelField="code"
                labelPrefix="Code"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> Districts
              </CardTitle>
              <CardDescription className="text-slate-500">
                Administrative districts under parent states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="districts"
                items={districts}
                parentItems={states}
                parentLabel="State"
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> Cities / Towns
              </CardTitle>
              <CardDescription className="text-slate-500">
                Cities and towns under parent districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="cities"
                items={cities}
                parentItems={districts}
                parentLabel="District"
                labelField="order"
                labelPrefix="Order"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
