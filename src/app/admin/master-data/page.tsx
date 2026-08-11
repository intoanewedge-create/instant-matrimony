import { masterDataService } from "@/lib/services/master-data.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Layers, Globe, GraduationCap, Briefcase, MapPin } from "lucide-react";

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
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Master Data Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized demographic, caste, religious, and geographic taxonomies used across the platform.
          </p>
        </div>
      </div>

      <Tabs defaultValue="religions" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <TabsTrigger value="religions" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4 mr-1.5" /> Religions ({religions.length})
          </TabsTrigger>
          <TabsTrigger value="castes" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4 mr-1.5" /> Castes ({castes.length})
          </TabsTrigger>
          <TabsTrigger value="languages" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <Globe className="w-4 h-4 mr-1.5" /> Languages ({motherTongues.length})
          </TabsTrigger>
          <TabsTrigger value="educations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-1.5" /> Education ({educations.length})
          </TabsTrigger>
          <TabsTrigger value="occupations" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <Briefcase className="w-4 h-4 mr-1.5" /> Professions ({occupations.length})
          </TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <MapPin className="w-4 h-4 mr-1.5" /> Locations ({states.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="religions" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" /> Religions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Registered community and faith taxonomies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {religions.length > 0 ? (
                  religions.map((r: any) => (
                    <div key={r.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{r.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">Order: {r.order ?? 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    No religion taxonomies seeded. Standard defaults will be loaded dynamically.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="castes" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" /> Caste Classifications
              </CardTitle>
              <CardDescription className="text-slate-400">
                Categorized castes and associated sub-castes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {castes.length > 0 ? (
                  castes.map((c: any) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{c.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">Order: {c.order ?? 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    No custom caste records seeded. All standard community options are available in user forms.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-500" /> Mother Tongues
              </CardTitle>
              <CardDescription className="text-slate-400">
                Primary regional spoken languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {motherTongues.length > 0 ? (
                  motherTongues.map((l: any) => (
                    <div key={l.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{l.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">{l.code || "ISO"}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    Telugu, English, Hindi, Tamil, Kannada, Malayalam are supported by default.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="educations" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-rose-500" /> Education Degrees & Qualifications
              </CardTitle>
              <CardDescription className="text-slate-400">
                Standardized academic qualifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {educations.length > 0 ? (
                  educations.map((e: any) => (
                    <div key={e.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{e.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">{e.category || "Degree"}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    B.Tech, M.Tech, MBBS, MS, MBA, MCA, B.Sc, B.Com, Chartered Accountant and other degrees configured.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupations" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-rose-500" /> Professions & Occupations
              </CardTitle>
              <CardDescription className="text-slate-400">
                Occupational fields and career categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {occupations.length > 0 ? (
                  occupations.map((o: any) => (
                    <div key={o.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{o.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">Active</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    Software Engineer, Doctor, Civil Services, Business, Professor, Banking, Architect and more.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="mt-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> Geographic Divisions & States
              </CardTitle>
              <CardDescription className="text-slate-400">
                Countries, states, and regional districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {states.length > 0 ? (
                  states.map((s: any) => (
                    <div key={s.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{s.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">{s.code || "IN"}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500">
                    Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Maharashtra, and international locations configured.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
