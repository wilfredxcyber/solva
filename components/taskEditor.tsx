"use client";

import { useEffect, useState } from "react";

import {
  Formik,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  FieldArrayRenderProps,
} from "formik";

import * as Yup from "yup";

import { format } from "date-fns";

import { CalendarIcon, Upload, Plus, Trash2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createAxiosInstance } from "@/lib/axios";

import { apis } from "@/lib/endpoints";

import { toast } from "react-toastify";

import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title is too long")
    .required("Campaign title is required"),

  overview: Yup.string()
    .min(30, "Overview should be more descriptive")
    .max(2000, "Overview is too long")
    .required("Campaign overview is required"),

  type: Yup.string().required("Campaign type is required"),

  sponsorName: Yup.string()
    .min(2, "Sponsor name is too short")
    .required("Sponsor name is required"),

  sponsorLogo: Yup.mixed().nullable(),
  bannerImage: Yup.mixed().nullable(),

  totalPool: Yup.number()
    .typeError("Reward pool must be a number")
    .positive("Reward pool must be greater than 0")
    .required("Reward pool is required"),

  totalSpots: Yup.number()
    .typeError("Total spots must be a number")
    .integer("Total spots must be a whole number")
    .positive("Total spots must be greater than 0")
    .required("Total spots is required"),

  startDate: Yup.date().nullable().required("Start date is required"),

  endDate: Yup.date()
    .nullable()
    .min(Yup.ref("startDate"), "End date must be after start date")
    .required("End date is required"),

  requirements: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(3, "Requirement is too short")
        .required("Requirement cannot be empty"),
    )
    .min(1, "Add at least one requirement"),

  guidelines: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(3, "Guideline is too short")
        .required("Guideline cannot be empty"),
    )
    .min(1, "Add at least one guideline"),

  selectionCriteria: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(3, "Criteria is too short")
        .required("Selection criteria cannot be empty"),
    )
    .min(1, "Add at least one selection criteria"),

  howToSubmit: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(3, "Submission step is too short")
        .required("Submission step cannot be empty"),
    )
    .min(1, "Add at least one submission step"),
});

const axiosInstance = createAxiosInstance();

export default function EditTaskPage({ taskId }: { taskId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<any>({
    title: "",
    overview: "",
    type: "",
    sponsorName: "",
    sponsorLogo: null,
    bannerImage: null,
    requirements: [""],
    guidelines: [""],
    selectionCriteria: [""],
    howToSubmit: [""],
    startDate: null,
    endDate: null,
    totalPool: "",
    totalSpots: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axiosInstance.get(`${apis.task}/${taskId}`);

        const task = response?.data?.data || response?.data;
        console.log(task);

        setInitialValues({
          title: task?.title || "",
          overview: task?.overview || "",
          type: task?.type || "",
          sponsorName: task?.sponsorName || "",
          sponsorLogo: null,
          bannerImage: null,

          requirements: Array.isArray(task?.requirements)
            ? task.requirements
            : task?.requirements
                ?.split(",")
                ?.map((item: string) => item.trim()) || [""],

          guidelines: Array.isArray(task?.guidelines)
            ? task.guidelines
            : task?.guidelines
                ?.split(",")
                ?.map((item: string) => item.trim()) || [""],

          selectionCriteria: Array.isArray(task?.selectionCriteria)
            ? task.selectionCriteria
            : [task?.selectionCriteria || ""],

          howToSubmit: Array.isArray(task?.howToSubmit)
            ? task.howToSubmit
            : [task?.howToSubmit || ""],

          startDate: task?.startDate ? new Date(task.startDate) : null,

          endDate: task?.endDate ? new Date(task.endDate) : null,

          totalPool: task?.totalPool || "",

          totalSpots: task?.totalSpots || "",
        });

        setLogoPreview(task?.sponsorLogo || null);

        setBannerPreview(task?.bannerImage || null);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch task");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const renderArrayField = (
    label: string,
    name: string,
    values: any,
    errors: any,
    touched: any,
  ) => {
    return (
      <FieldArray name={name}>
        {({ push, remove }: FieldArrayRenderProps) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  {label}
                </h3>

                <p className="text-sm text-[#666666]">
                  Add all necessary {label.toLowerCase()}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => push("")}
                className="h-10 rounded-xl bg-[#5427D7] hover:bg-[#5427D7]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {values[name].map((_: string, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] p-3">
                    <Field
                      as={Input}
                      name={`${name}.${index}`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className="h-11 border-[#E5E5E5] bg-white"
                    />

                    {values[name].length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => remove(index)}
                        className="h-11 w-11 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <ErrorMessage
                    name={`${name}.${index}`}
                    component="p"
                    className="pl-2 text-sm text-red-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </FieldArray>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8FA] px-4 py-10 text-black md:px-8">
      <div className="mx-auto max-w-full">
        {/* HEADER */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5427D7]" />

            <p className="text-xs uppercase tracking-[0.3em] text-[#5427D7]">
              Edit Campaign
            </p>
          </div>

          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-black md:text-5xl">
            Update your
            <span className="text-[#5427D7]"> sponsored campaign</span>
          </h1>
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const formData = new FormData();

              formData.append("title", values.title);

              formData.append("overview", values.overview);

              formData.append("type", values.type);

              formData.append("sponsorName", values.sponsorName);

              formData.append("totalPool", String(values.totalPool));

              formData.append("totalSpots", String(values.totalSpots));

              formData.append(
                "startDate",
                values.startDate
                  ? new Date(values.startDate).toISOString()
                  : "",
              );

              formData.append(
                "endDate",
                values.endDate ? new Date(values.endDate).toISOString() : "",
              );

              values.requirements.forEach((item: string) => {
                formData.append("requirements[]", item);
              });

              values.guidelines.forEach((item: string) => {
                formData.append("guidelines[]", item);
              });

              values.selectionCriteria.forEach((item: string) => {
                formData.append("selectionCriteria[]", item);
              });

              values.howToSubmit.forEach((item: string) => {
                formData.append("howToSubmit[]", item);
              });

              if (values.sponsorLogo instanceof File) {
                formData.append("sponsorLogo", values.sponsorLogo);
              }

              if (values.bannerImage instanceof File) {
                formData.append("bannerImage", values.bannerImage);
              }

              const response = await axiosInstance.patch(
                `${apis.task}/${taskId}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                },
              );

              toast.success(
                response?.data?.message || "Campaign updated successfully",
              );

              router.push("/tasks/task");
            } catch (error: any) {
              toast.error(error?.response?.data?.message || "Update failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => {
            console.log(errors);
            console.log(touched);
            return (
              <Form className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                {/* LEFT */}
                <div className="space-y-6">
                  <Card className="rounded-3xl border border-[#ECECEC] bg-white shadow-sm">
                    <CardContent className="space-y-8 p-7">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Campaign Title
                          </label>

                          <Field
                            as={Input}
                            name="title"
                            className="h-12 rounded-xl"
                          />

                          <ErrorMessage
                            name="title"
                            component="p"
                            className="text-sm text-red-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Campaign Type
                          </label>

                          <Field
                            as={Input}
                            name="type"
                            className="h-12 rounded-xl"
                          />

                          <ErrorMessage
                            name="type"
                            component="p"
                            className="text-sm text-red-500"
                          />
                        </div>
                      </div>

                      {/* OVERVIEW */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Campaign Overview
                        </label>

                        <Field
                          as={Textarea}
                          name="overview"
                          className="min-h-[160px] rounded-2xl"
                        />

                        <ErrorMessage
                          name="overview"
                          component="p"
                          className="text-sm text-red-500"
                        />
                      </div>

                      {/* SPONSOR */}
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Sponsor Name
                          </label>

                          <Field
                            as={Input}
                            name="sponsorName"
                            className="h-12 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Reward Pool
                          </label>

                          <Field
                            as={Input}
                            name="totalPool"
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* SPOTS */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Total Spots
                        </label>

                        <Field
                          as={Input}
                          name="totalSpots"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      {/* DATES */}
                      <div className="grid gap-5 md:grid-cols-2">
                        {/* START DATE */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Start Date
                          </label>

                          <Popover>
                            <PopoverTrigger asChild>
                              <div
                                className={cn(
                                  "flex h-12 w-full cursor-pointer items-center rounded-2xl border px-4",
                                  values.startDate
                                    ? "text-black"
                                    : "text-[#9A9A9A]",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#5427D7]" />

                                {values.startDate
                                  ? format(values.startDate, "PPP")
                                  : "Select date"}
                              </div>
                            </PopoverTrigger>

                            <PopoverContent>
                              <Calendar
                                mode="single"
                                selected={values.startDate}
                                onSelect={(date) =>
                                  setFieldValue("startDate", date)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* END DATE */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            End Date
                          </label>

                          <Popover>
                            <PopoverTrigger asChild>
                              <div
                                className={cn(
                                  "flex h-12 w-full cursor-pointer items-center rounded-2xl border px-4",
                                  values.endDate
                                    ? "text-black"
                                    : "text-[#9A9A9A]",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#5427D7]" />

                                {values.endDate
                                  ? format(values.endDate, "PPP")
                                  : "Select date"}
                              </div>
                            </PopoverTrigger>

                            <PopoverContent>
                              <Calendar
                                mode="single"
                                selected={values.endDate}
                                onSelect={(date) =>
                                  setFieldValue("endDate", date)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ARRAYS */}
                  <Card className="rounded-3xl border border-[#ECECEC] bg-white shadow-sm">
                    <CardContent className="space-y-10 p-7">
                      {renderArrayField(
                        "Requirements",
                        "requirements",
                        values,
                        errors,
                        touched,
                      )}

                      {renderArrayField(
                        "Guidelines",
                        "guidelines",
                        values,
                        errors,
                        touched,
                      )}

                      {renderArrayField(
                        "Selection Criteria",
                        "selectionCriteria",
                        values,
                        errors,
                        touched,
                      )}

                      {renderArrayField(
                        "How To Submit",
                        "howToSubmit",
                        values,
                        errors,
                        touched,
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                  <Card className="sticky top-6 rounded-3xl border border-[#ECECEC] bg-white shadow-sm">
                    <CardContent className="space-y-7 p-7">
                      <div>
                        <h2 className="text-xl font-semibold">Upload Assets</h2>
                      </div>

                      {/* LOGO */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Sponsor Logo
                        </label>

                        <label className="flex h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed bg-[#FAFAFA]">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="logo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <>
                              <Upload className="mb-3 h-6 w-6 text-[#5427D7]" />

                              <p>Upload Sponsor Logo</p>
                            </>
                          )}

                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file) {
                                setFieldValue("sponsorLogo", file);

                                setLogoPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* BANNER */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Banner Image
                        </label>

                        <label className="flex h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed bg-[#FAFAFA]">
                          {bannerPreview ? (
                            <img
                              src={bannerPreview}
                              alt="banner"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <>
                              <Upload className="mb-3 h-6 w-6 text-[#5427D7]" />

                              <p>Upload Banner</p>
                            </>
                          )}

                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file) {
                                setFieldValue("bannerImage", file);

                                setBannerPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* BUTTON */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-14 w-full rounded-2xl bg-[#5427D7] text-base font-semibold text-white"
                      >
                        {isSubmitting ? "Updating..." : "Update Campaign"}
                      </Button>

                      {/* ERROR SUMMARY */}
                      {Object.keys(errors).length > 0 && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />

                            <div>
                              <p className="font-medium text-red-700">
                                Please fix the form errors
                              </p>

                              <p className="mt-1 text-sm text-red-500">
                                Some required fields are missing.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
