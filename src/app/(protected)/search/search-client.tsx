"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { searchMatchesAction } from "@/lib/actions/search.actions";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Filter, Heart, MapPin, Search } from "lucide-react";

export function SearchClient({ initialResults, defaultGender }: { initialResults: any; defaultGender: string }) {
  const [results, setResults] = useState(initialResults || []);
  const [loading, setLoading] = useState(false);
  const [interestLoadingId, setInterestLoadingId] = useState<string | null>(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      gender: defaultGender,
      minAge: "",
      maxAge: "",
      religion: "",
      caste: "",
      city: "",
      state: "",
      country: "",
      minIncome: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (data.gender) filters.gender = data.gender;
      if (data.minAge) filters.minAge = Number(data.minAge);
      if (data.maxAge) filters.maxAge = Number(data.maxAge);
      if (data.religion) filters.religion = data.religion;
      if (data.caste) filters.caste = data.caste;
      if (data.city) filters.city = data.city;
      if (data.state) filters.state = data.state;
      if (data.country) filters.country = data.country;
      if (data.minIncome) filters.minIncome = Number(data.minIncome);

      const res = await searchMatchesAction(filters);
      if (res.success) {
        setResults(res.results || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (receiverId: string) => {
    setInterestLoadingId(receiverId);
    try {
      const res = await sendInterestAction(receiverId);
      if (res.success) {
        setResults((prev: any) =>
          prev.map((r: any) =>
            r.profile.userId === receiverId ? { ...r, interestSent: true } : r
          )
        );
      }
    } catch (e) {
      // ignore
    } finally {
      setInterestLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-8">
            <CardHeader className="border-b border-slate-800/60">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-rose-500" /> Filter Matches
              </CardTitle>
              <CardDescription>Refine suggestions based on criteria</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full h-10 px-3 border border-slate-800 bg-slate-950/50 rounded-md text-white focus:border-rose-500"
                    {...register("gender")}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Min Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      placeholder="18"
                      className="border-slate-800 bg-slate-950/50"
                      {...register("minAge")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Max Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      placeholder="40"
                      className="border-slate-800 bg-slate-950/50"
                      {...register("maxAge")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    placeholder="e.g. Hindu, Muslim"
                    className="border-slate-800 bg-slate-950/50"
                    {...register("religion")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caste">Caste</Label>
                  <Input
                    id="caste"
                    placeholder="e.g. Patel, Brahmin"
                    className="border-slate-800 bg-slate-950/50"
                    {...register("caste")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    className="border-slate-800 bg-slate-950/50"
                    {...register("city")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minIncome">Min Income (Lakhs INR)</Label>
                  <Input
                    id="minIncome"
                    type="number"
                    placeholder="e.g. 5"
                    className="border-slate-800 bg-slate-950/50"
                    {...register("minIncome")}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500">
                  {loading ? <Spinner className="w-5 h-5 mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Matches Search Results Grid */}
        <div className="flex-grow space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="w-6 h-6 text-rose-500" /> Matched Results ({results.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {results.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-slate-400">No matching profiles found. Try broadening search filters.</p>
                </div>
              ) : (
                results.map((r: any, index: number) => (
                  <motion.div
                    key={r.profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden flex flex-col h-full hover:border-slate-700 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-bold text-slate-200">
                              <Link href={`/profile/${r.profile.userId}`} className="hover:text-rose-400 transition-colors">
                                {r.profile.name || "Matrimony Member"}
                              </Link>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 text-slate-400">
                              <MapPin className="w-3.5 h-3.5" /> {r.profile.city}, {r.profile.state}
                            </CardDescription>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {r.compatibility?.score}% Match
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3 pt-2 text-sm text-slate-300">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-500">Age / Height:</span> {r.profile.age} yrs • {r.profile.height} cm</div>
                          <div><span className="text-slate-500">Marital Status:</span> {r.profile.maritalStatus}</div>
                          <div><span className="text-slate-500">Religion / Caste:</span> {r.profile.religion} • {r.profile.caste || "N/A"}</div>
                          <div><span className="text-slate-500">Mother Tongue:</span> {r.profile.motherTongue}</div>
                        </div>
                        {r.profile.bio && (
                          <p className="text-xs text-slate-400 line-clamp-3 italic">
                            &ldquo;{r.profile.bio}&rdquo;
                          </p>
                        )}
                        {r.compatibility?.matchedFields?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {r.compatibility.matchedFields.map((field: string) => (
                              <span key={field} className="text-[10px] bg-green-950/40 text-green-400 border border-green-900/50 px-2 py-0.5 rounded-full">
                                ✓ {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/20">
                        <Link href={`/profile/${r.profile.userId}`}>
                          <Button variant="outline" className="border-slate-850 hover:bg-slate-800 hover:text-white text-xs px-4 h-9">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          disabled={r.interestSent || interestLoadingId === r.profile.userId}
                          onClick={() => handleSendInterest(r.profile.userId)}
                          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs px-4 h-9"
                        >
                          <Heart className="w-3.5 h-3.5 mr-1.5" /> {r.interestSent ? "Interest Sent" : "Connect"}
                        </Button>
                      </div>

                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
