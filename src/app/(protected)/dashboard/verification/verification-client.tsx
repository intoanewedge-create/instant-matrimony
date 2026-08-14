"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Camera,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Plus,
  Star,
  ShieldCheck,
  X,
  FileImage,
  ImageIcon,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  uploadPhoto,
  replacePhoto,
  deletePhoto,
  setPrimaryPhoto,
  uploadVerificationDocument,
  submitVerification,
} from "@/lib/actions/media.actions";

export function VerificationClient({ initialPhotos, initialVerification }: any) {
  const [photos, setPhotos] = useState<any[]>(initialPhotos);
  const [verification, setVerification] = useState<any>(initialVerification);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Identity Form State
  const [docType, setDocType] = useState<string>("AADHAAR");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);

  // Photo actions
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev !== null && prev < 90 ? prev + 15 : prev));
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadPhoto(formData);
      clearInterval(interval);
      setUploadProgress(100);

      if (res.success) {
        setSuccessMsg("Photo uploaded successfully. It is pending moderation review.");
        // Reload photos dynamically
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to upload photo");
      }
    } catch (e: any) {
      clearInterval(interval);
      setErrorMsg(e.message || "An error occurred during upload.");
    } finally {
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handlePhotoReplace = async (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await replacePhoto(photoId, formData);
      setUploadProgress(100);

      if (res.success) {
        setSuccessMsg("Photo replaced successfully. It is pending moderation review.");
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to replace photo");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred.");
    } finally {
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await deletePhoto(photoId);
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSuccessMsg("Photo deleted successfully.");
      } else {
        setErrorMsg(res.error || "Failed to delete photo");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred.");
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await setPrimaryPhoto(photoId);
      if (res.success) {
        setPhotos((prev) =>
          prev.map((p) => ({
            ...p,
            isMain: p.id === photoId,
          }))
        );
        setSuccessMsg("Primary profile photo updated successfully.");
      } else {
        setErrorMsg(res.error || "Failed to update primary photo");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred.");
    }
  };

  // Submit identity verification
  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !selfieFile) {
      setErrorMsg("Please upload both your government ID and a selfie.");
      return;
    }

    setIsSubmittingVerif(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Upload Doc
      const docFormData = new FormData();
      docFormData.append("file", docFile);
      const docRes = await uploadVerificationDocument(docFormData);

      if (!docRes.success || !docRes.mediaId) {
        throw new Error(docRes.error || "Failed to upload government ID document.");
      }

      // 2. Upload Selfie
      const selfieFormData = new FormData();
      selfieFormData.append("file", selfieFile);
      const selfieRes = await uploadVerificationDocument(selfieFormData);

      if (!selfieRes.success || !selfieRes.mediaId) {
        throw new Error(selfieRes.error || "Failed to upload selfie photo.");
      }

      // 3. Submit
      const submitRes = await submitVerification({
        documentType: docType,
        documentMediaId: docRes.mediaId,
        selfieMediaId: selfieRes.mediaId,
      });

      if (submitRes.success) {
        setSuccessMsg("Verification request submitted successfully. Moderation will review shortly.");
        setVerification({
          status: "PENDING",
          documentType: docType,
          documentUrl: docRes.url,
          selfieUrl: selfieRes.url,
        });
        setDocFile(null);
        setSelfieFile(null);
      } else {
        throw new Error(submitRes.error || "Failed to submit verification request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during submission.");
    } finally {
      setIsSubmittingVerif(false);
    }
  };

  return (
    <div className="space-y-8 select-none text-slate-900">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Verification & Media Workspace
        </h1>
        <p className="text-slate-500 mt-2">
          Verify your identity to claim your verified badge and manage your profile photos.
        </p>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Uploading & Processing Image...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5 bg-slate-100" />
        </div>
      )}

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="photos" className="rounded-lg text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold py-2">
            Profile Photos ({photos.length}/6)
          </TabsTrigger>
          <TabsTrigger value="verification" className="rounded-lg text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold py-2">
            Identity Verification
          </TabsTrigger>
        </TabsList>

        {/* PHOTOS TAB */}
        <TabsContent value="photos" className="mt-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <ImageIcon className="w-5 h-5 text-rose-600" /> Photo Management
              </CardTitle>
              <CardDescription className="text-slate-500">
                Upload up to 6 high-quality, clear portrait photos. The first approved photo will automatically become your profile cover.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Photo grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50 aspect-[3/4] flex flex-col justify-between shadow-sm"
                  >
                    {/* Image display */}
                    <div className="relative w-full flex-1 bg-slate-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt="Profile Photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Cover/Primary indicator badge */}
                      {photo.isMain && (
                        <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/30 shadow-md select-none">
                          <Star className="w-3 h-3 fill-white" /> Cover Photo
                        </span>
                      )}

                      {/* Approval status overlay */}
                      <div className="absolute bottom-3 left-3 select-none">
                        {photo.isApproved ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="p-3 border-t border-slate-200 bg-white flex justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={photo.isMain}
                        onClick={() => handleSetPrimary(photo.id)}
                        className={`text-[10px] py-1 border-slate-200 shadow-xs ${
                          photo.isMain ? "bg-slate-100 text-slate-400" : "hover:bg-slate-50 text-slate-700 font-semibold"
                        }`}
                      >
                        Set Cover
                      </Button>

                      <div className="flex gap-2">
                        {/* Replace in-place */}
                        <label className="border border-slate-200 hover:bg-slate-50 rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-colors text-slate-600 hover:text-slate-900 shadow-xs">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoReplace(photo.id, e)}
                            className="hidden"
                          />
                        </label>

                        {/* Delete photo */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePhotoDelete(photo.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg border border-red-200 w-8 h-8 flex items-center justify-center shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Upload Placeholder Slot */}
                {photos.length < 6 && (
                  <label className="border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-xl aspect-[3/4] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-rose-50/30 group shadow-xs">
                    <div className="p-4 rounded-full bg-white group-hover:bg-rose-100 text-slate-400 group-hover:text-rose-600 transition-colors shadow-sm">
                      <Plus className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 mt-4">Upload Photo</span>
                    <span className="text-xs text-slate-500 mt-1">JPEG, PNG, or WebP. Max 5MB.</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IDENTITY VERIFICATION TAB */}
        <TabsContent value="verification" className="mt-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-5 h-5 text-rose-600" /> Identity Verification
              </CardTitle>
              <CardDescription className="text-slate-500">
                Confirm your identity with a government-issued document and verification selfie to receive your verified profile badge.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Show current status banner */}
              {verification?.status === "APPROVED" && (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none shadow-sm">
                  <div className="p-3 bg-emerald-100 rounded-full text-emerald-700">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-lg">Identity Verified Successfully</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      Your government ID ({verification.documentType}) has been verified. A green checkmark badge is active on your public profile!
                    </p>
                  </div>
                </div>
              )}

              {verification?.status === "PENDING" && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none shadow-sm">
                  <div className="p-3 bg-amber-100 rounded-full text-amber-700">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-lg">Verification Under Review</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Our moderation team is reviewing your ID and selfie. This process usually completes in less than 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {(verification?.status === "REJECTED" || verification?.status === "RE_UPLOAD" || !verification) && (
                <div className="space-y-6">
                  {/* Warning message if rejected or reupload */}
                  {verification?.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex gap-3 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Submission rejected:</span>
                        <span className="text-xs text-red-700 mt-1 block">{verification.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Submission form */}
                  <form onSubmit={handleIdentitySubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800">1. Select Document Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["AADHAAR", "PAN", "PASSPORT", "DRIVING_LICENCE"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDocType(t)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all shadow-xs ${
                              docType === t
                                ? "bg-rose-50 text-rose-700 border-rose-400 ring-1 ring-rose-400"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {t.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Document upload card */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">2. Upload Government ID Scan</label>
                        <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center relative min-h-[160px] hover:border-rose-400 hover:bg-rose-50/20 transition-all shadow-xs">
                          {docFile ? (
                            <div className="flex flex-col items-center space-y-2">
                              <FileText className="w-10 h-10 text-rose-600" />
                              <span className="text-xs font-semibold text-slate-800 max-w-[200px] truncate">
                                {docFile.name}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDocFile(null)}
                                className="text-[10px] text-slate-500 hover:text-slate-900"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer">
                              <Upload className="w-8 h-8 text-slate-400 mb-2" />
                              <span className="text-xs font-bold text-slate-700">Upload document photo</span>
                              <span className="text-[10px] text-slate-500 mt-1">PDF, JPG, or PNG (Max 5MB)</span>
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Selfie upload card */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">3. Upload Verification Selfie</label>
                        <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center relative min-h-[160px] hover:border-rose-400 hover:bg-rose-50/20 transition-all shadow-xs">
                          {selfieFile ? (
                            <div className="flex flex-col items-center space-y-2">
                              <FileImage className="w-10 h-10 text-rose-600" />
                              <span className="text-xs font-semibold text-slate-800 max-w-[200px] truncate">
                                {selfieFile.name}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelfieFile(null)}
                                className="text-[10px] text-slate-500 hover:text-slate-900"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer">
                              <Camera className="w-8 h-8 text-slate-400 mb-2" />
                              <span className="text-xs font-bold text-slate-700">Upload portrait selfie</span>
                              <span className="text-[10px] text-slate-500 mt-1">Make sure face is clearly visible</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmittingVerif || !docFile || !selfieFile}
                      className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3 shadow-md shadow-rose-500/20"
                    >
                      {isSubmittingVerif ? "Submitting Verification..." : "Submit for Moderation"}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
