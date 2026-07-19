"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  UploadCloud,
  Link2,
  DollarSign,
  Clock,
  Trash2,
  Rocket,
} from "lucide-react";
import { useCourses } from "../useCourses";
import { createAxiosInstance } from "@/lib/axios";
import { apis } from "@/lib/endpoints";

const CreateShortCourse = () => {
  const router = useRouter();
  const { createCourse, loading } = useCourses();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const axiosInstance = createAxiosInstance();

  const [form, setForm] = useState({
    title: "",
    category: "Design & Creative",
    difficulty: "",
    description: "",
    thumbnail: null as File | null,
    thumbnailPreview: null as string | null,
    startLearningLink: "",
    isFree: true,
    regularPrice: "",
    discountedPrice: "",
    duration: "",
    certificate: false,
  });

  const [dragging, setDragging] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, thumbnail: file, thumbnailPreview: preview }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSave = async (publishStatus: "published" | "draft") => {
    if (!form.title.trim()) {
      alert("Course title is required");
      return;
    }

    if (!form.thumbnail) {
      alert("Please upload a course thumbnail image before saving.");
      return;
    }

    // Backend expects multipart/form-data for course creation to handle the image
    const formData = new FormData();
    formData.append("name", form.title);
    formData.append("category", form.category);
    formData.append("difficulty", form.difficulty || "Beginner");
    formData.append("description", form.description);
    formData.append("link", form.startLearningLink);
    formData.append("duration", String(Number(form.duration) || 0));
    formData.append("price", String(Number(form.regularPrice) || 0));
    formData.append("discountPrice", String(Number(form.discountedPrice) || 0));
    formData.append("status", publishStatus);
    
    // Note: Backend must parse these strings into booleans/numbers on their end
    formData.append("isFree", form.isFree ? "true" : "false");
    formData.append("hasCertificate", form.certificate ? "true" : "false");

    // Append the actual file object
    formData.append("thumbnail", form.thumbnail);

    const entries = Object.fromEntries(formData.entries());
    if (!window.confirm(`Debug Payload (Screenshot this for backend dev!):\n\n${JSON.stringify(entries, null, 2)}`)) {
      return;
    }

    await createCourse(formData as any);
  };

  const handleDiscard = () => {
    router.push("/short-courses");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F8] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Set up your educational content with Lumina's premium course builder.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/short-courses")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
              </div>

              {/* Course Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Advanced UI Design Principles"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>

              {/* Category + Difficulty */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                  >
                    <option>Design & Creative</option>
                    <option>Marketing</option>
                    <option>Coding</option>
                    <option>Business</option>
                    <option>Photography</option>
                    <option>Music</option>
                    <option>Others</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                  >
                    <option value="">Select level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the core outcomes and value of this course..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                />
              </div>
            </div>

            {/* Pricing & Access */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Pricing & Access</h2>
              </div>

              {/* Free Toggle */}
              <div
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-5 transition-colors ${
                  form.isFree ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isFree: !p.isFree }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    form.isFree ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isFree ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    This is a free course
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Students can enroll without any payment.
                  </p>
                </div>
              </div>

              {/* Price + Duration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Regular Price (₦)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
                    <span className="text-green-600 font-semibold text-sm">₦</span>
                    <input
                      type="number"
                      name="regularPrice"
                      value={form.regularPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={form.isFree}
                      className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50 bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Discounted Price (₦)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
                    <span className="text-green-600 font-semibold text-sm">₦</span>
                    <input
                      type="number"
                      name="discountedPrice"
                      value={form.discountedPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={form.isFree}
                      className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50 bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Duration (Hours)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
                    <input
                      type="number"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Certificate */}
              <label
                className={`flex items-start gap-4 px-4 py-3.5 rounded-xl cursor-pointer border transition-colors ${
                  form.certificate
                    ? "bg-primary/5 border-primary/20"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.certificate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, certificate: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Enable Certificate of Completion
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Learners will receive a digital Lumina certificate upon finishing all modules.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Right Column — Course Media */}
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🎬</span>
                <h2 className="text-base font-bold text-gray-900">Course Media</h2>
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>

                {form.thumbnailPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={form.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          thumbnail: null,
                          thumbnailPreview: null,
                        }))
                      }
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 px-4 cursor-pointer transition-colors ${
                      dragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <UploadCloud className="w-10 h-10 text-primary mb-2" />
                    <p className="text-sm font-medium text-gray-700 text-center">
                      Drop image here
                    </p>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      PNG, JPG or WEBP (Max 2MB)
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>
                )}
              </div>

              {/* Start Learning Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start learning Link
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
                  <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    name="startLearningLink"
                    value={form.startLearningLink}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4 z-40">
        <button
          onClick={handleDiscard}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
        >
          <Trash2 className="w-4 h-4" />
          Discard Draft
        </button>
        <button 
            onClick={() => handleSave("draft")}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
          >
            <Rocket className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Course"}
          </button>
      </div>
    </div>
  );
};

export default CreateShortCourse;
