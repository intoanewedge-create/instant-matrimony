"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { UserPlus, ArrowLeft, Check, AlertCircle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateProfileAction } from "@/lib/actions/profile.actions";
import { Spinner } from "@/components/ui/spinner";

export default function AdminCreateProfilePage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "MALE",
    profileCreatedFor: "Self",
    dateOfBirth: "",
    maritalStatus: "Never Married",
    religion: "Hindu",
    caste: "",
    subCaste: "",
    gothram: "",
    height: 168,
    weight: 65,
    education: "",
    occupation: "",
    income: 800000,
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    bio: "",
    familyValues: "Moderate",
    familyDetails: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const res = await adminCreateProfileAction(formData);
      if (res.success) {
        setSuccess(`Matrimonial profile created successfully! Account is ready for immediate member login.`);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          gender: "MALE",
          profileCreatedFor: "Self",
          dateOfBirth: "",
          maritalStatus: "Never Married",
          religion: "Hindu",
          caste: "",
          subCaste: "",
          gothram: "",
          height: 168,
          weight: 65,
          education: "",
          occupation: "",
          income: 800000,
          city: "Hyderabad",
          district: "Hyderabad",
          state: "Telangana",
          country: "India",
          bio: "",
          familyValues: "Moderate",
          familyDetails: "",
        });
      } else {
        setError(res.error || "Failed to create profile");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/profiles"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-rose-600" /> Admin — Create Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and provision a complete active matrimonial profile with credentials.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Member Account & Profile Details
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Account will be created with status ACTIVE and profile status APPROVED. Credentials can be used for immediate login.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-900 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Credentials & Demographics */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Basic Info & Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Ananya Reddy"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="member@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="+919876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Account Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Password@123"
                    value={formData.password}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="MALE">Male (Groom)</option>
                    <option value="FEMALE">Female (Bride)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profileCreatedFor" className="text-xs font-semibold text-slate-700">Profile Created For</Label>
                  <select
                    id="profileCreatedFor"
                    name="profileCreatedFor"
                    value={formData.profileCreatedFor}
                    onChange={handleChange}
                    className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Self">Self</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Cultural Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Cultural Background & Physical Attributes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-slate-700">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maritalStatus" className="text-xs font-semibold text-slate-700">Marital Status</Label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="religion" className="text-xs font-semibold text-slate-700">Religion</Label>
                  <Input
                    id="religion"
                    name="religion"
                    placeholder="Hindu"
                    value={formData.religion}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="caste" className="text-xs font-semibold text-slate-700">Caste</Label>
                  <Input
                    id="caste"
                    name="caste"
                    placeholder="Reddy / Kamma / Brahmin etc."
                    value={formData.caste}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-xs font-semibold text-slate-700">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="education" className="text-xs font-semibold text-slate-700">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    placeholder="B.Tech / M.S. / MBA"
                    value={formData.education}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="occupation" className="text-xs font-semibold text-slate-700">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    placeholder="Software Engineer / Doctor"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Hyderabad"
                    value={formData.city}
                    onChange={handleChange}
                    className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">About Me / Summary Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Provide a short description of the bride/groom..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="border-slate-200 bg-slate-50 text-slate-900 text-xs focus-visible:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/admin/profiles">
                <Button variant="outline" type="button" className="text-xs font-semibold rounded-xl border-slate-200 text-slate-600">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs px-6 shadow-md shadow-rose-500/20 rounded-xl h-10 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
