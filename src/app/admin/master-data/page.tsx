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
    motherTonguesRes,
    educationsRes,
    occupationsRes,
    countriesRes,
    statesRes,
  ] = await Promise.all([
    masterDataService.getReligions(),
    masterDataService.getCastes(),
    masterDataService.getMotherTongues(),
    masterDataService.getEducations(),
    masterDataService.getOccupations(),
    masterDataService.getCountries(),
    masterDataService.getStates(),
  ]);

  const religions = religionsRes.success && Array.isArray(religionsRes.data) ? religionsRes.data : [];
  const castes = castesRes.success && Array.isArray(castesRes.data) ? castesRes.data : [];
  const motherTongues = motherTonguesRes.success && Array.isArray(motherTonguesRes.data) ? motherTonguesRes.data : [];
  const educations = educationsRes.success && Array.isArray(educationsRes.data) ? educationsRes.data : [];
  const occupations = occupationsRes.success && Array.isArray(occupationsRes.data) ? occupationsRes.data : [];
  const countries = countriesRes.success && Array.isArray(countriesRes.data) ? countriesRes.data : [];
  const states = statesRes.success && Array.isArray(statesRes.data) ? statesRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Master Data Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Standardized demographic, caste, religious, and geographic taxonomies used across the platform.
          </p>
        </div>
      </div>

      <Tabs defaultValue="religions" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1.5 bg-slate-100 border border-slate-200 p-1.5 rounded-xl">
          <TabsTrigger value="religions" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <Layers className="w-4 h-4 mr-1.5" /> Religions ({religions.length})
          </TabsTrigger>
          <TabsTrigger value="castes" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <Layers className="w-4 h-4 mr-1.5" /> Castes ({castes.length})
          </TabsTrigger>
          <TabsTrigger value="languages" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <Globe className="w-4 h-4 mr-1.5" /> Languages ({motherTongues.length})
          </TabsTrigger>
          <TabsTrigger value="educations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <GraduationCap className="w-4 h-4 mr-1.5" /> Education ({educations.length})
          </TabsTrigger>
          <TabsTrigger value="occupations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <Briefcase className="w-4 h-4 mr-1.5" /> Professions ({occupations.length})
          </TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-700 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 mr-1.5" /> Locations ({states.length})
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
                Categorized castes and associated sub-castes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="castes"
                items={castes}
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
                Primary regional spoken languages
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
                <GraduationCap className="w-5 h-5 text-rose-500" /> Education Degrees &amp; Qualifications
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
                Occupational fields and career categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="occupations"
                items={occupations}
                labelField="status"
                labelPrefix="Status"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="mt-6">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> Geographic Divisions &amp; States
              </CardTitle>
              <CardDescription className="text-slate-500">
                Countries, states, and regional districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableMasterDataList
                category="states"
                items={states}
                labelField="code"
                labelPrefix="Code"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
