"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profile-card";
import {
  PUBLIC_PROFILES,
  RELIGION_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
} from "@/lib/mock-profiles";

const ANY = "Any";

export default function BasicSearch() {
  const [gender, setGender] = useState<string>("Female");
  const [religion, setReligion] = useState<string>(ANY);
  const [motherTongue, setMotherTongue] = useState<string>(ANY);
  const [minAge, setMinAge] = useState<number>(21);
  const [maxAge, setMaxAge] = useState<number>(40);
  const [query, setQuery] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const results = useMemo(() => {
    if (!submitted) return PUBLIC_PROFILES;
    const q = query.trim().toLowerCase();
    return PUBLIC_PROFILES.filter((p) => {
      if (gender !== ANY && p.gender !== gender) return false;
      if (religion !== ANY && p.religion !== religion) return false;
      if (motherTongue !== ANY && p.motherTongue !== motherTongue) return false;
      if (p.age < minAge || p.age > maxAge) return false;
      if (q) {
        const haystack =
          `${p.name} ${p.city} ${p.state} ${p.education} ${p.profession} ${p.community}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [submitted, gender, religion, motherTongue, minAge, maxAge, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setGender("Female");
    setReligion(ANY);
    setMotherTongue(ANY);
    setMinAge(21);
    setMaxAge(40);
    setQuery("");
    setSubmitted(false);
  };

  const selectClass =
    "w-full bg-secondary border border-border/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 via-transparent to-background py-16 border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Basic Search</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Find Your Match
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Filter our sample verified profiles by age, religion, mother tongue
            and keywords. Register free for advanced filters and unlimited
            results.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-3">
            <form
              onSubmit={handleSearch}
              data-testid="search-form"
              className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm sticky top-24 space-y-5"
            >
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Looking for
                </label>
                <select
                  data-testid="filter-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={selectClass}
                >
                  <option value={ANY}>Any</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Religion
                </label>
                <select
                  data-testid="filter-religion"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className={selectClass}
                >
                  <option value={ANY}>Any</option>
                  {RELIGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Mother Tongue
                </label>
                <select
                  data-testid="filter-mother-tongue"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className={selectClass}
                >
                  <option value={ANY}>Any</option>
                  {MOTHER_TONGUE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Min Age
                  </label>
                  <input
                    data-testid="filter-min-age"
                    type="number"
                    min={18}
                    max={80}
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Max Age
                  </label>
                  <input
                    data-testid="filter-max-age"
                    type="number"
                    min={18}
                    max={80}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className={selectClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    data-testid="filter-keyword"
                    type="text"
                    placeholder="City, profession..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`${selectClass} pl-9`}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  data-testid="search-submit"
                >
                  <Search className="h-4 w-4" /> Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleReset}
                  data-testid="search-reset"
                >
                  Reset Filters
                </Button>
              </div>
            </form>
          </aside>

          {/* Results */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-sm font-medium text-muted-foreground"
                data-testid="search-result-count"
              >
                {results.length} {results.length === 1 ? "profile" : "profiles"}{" "}
                found
              </p>
            </div>

            {results.length > 0 ? (
              <div
                data-testid="search-results"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {results.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div
                data-testid="search-empty"
                className="bg-card border border-border/50 rounded-2xl p-12 text-center"
              >
                <div className="flex justify-center mb-4 text-muted-foreground">
                  <Users2 className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-bold">
                  No profiles match your filters
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try widening your age range or clearing some filters.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    data-testid="search-empty-reset"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-12 bg-primary/5 border border-primary/15 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Want smarter matches based on horoscope, income and lifestyle?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline"
                >
                  Register free
                </Link>{" "}
                to access advanced search.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
