import { createAxiosInstance } from "@/lib/axios";
import { apis } from "@/lib/endpoints";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface CourseI {
  id?: string;
  _id?: string;
  name: string;
  category?: string;
  difficulty?: string;
  description?: string;
  link?: string; // previously startLearningLink
  isFree?: boolean | string; // backend may return "true"/"false" strings
  price?: number | null | string;
  discountPrice?: number | null | string;
  regularPrice?: string;
  discountedPrice?: string;
  duration?: string;
  certificate?: boolean | string; // legacy field
  hasCertificate?: boolean | string; // current backend field name
  thumbnail?: string;
  status?: string;
  createdAt?: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [loading, setLoading] = useState(false);
  const axios = createAxiosInstance();
  const router = useRouter();
  const [openDeleteModal, setDeleteModal] = useState(false);

  const createCourse = async (courseData: CourseI | FormData) => {
    setLoading(true);
    try {
      const token = Cookies.get("accessToken");

      const response = await axios.post(`${apis.course}`, courseData);

      if (response.status === 200 || response.status === 201) {
        const isFormData = courseData instanceof FormData;
        const statusVal = isFormData ? courseData.get("status") : (courseData as any).status;
        toast.success(`Course ${statusVal?.toString().toLowerCase() === "published" ? "published" : "saved as draft"} successfully!`);
        // We omit adding to `courses` array immediately, a refresh will handle it
        router.replace("/short-courses");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("BACKEND ERROR DETAILS:", err.response?.data);
      alert(`Backend Validation Error:\n\n${JSON.stringify(err.response?.data, null, 2)}`);
      toast.error(err.response?.data?.message || "Something went wrong while creating the course");
    } finally {
      setLoading(false);
    }
  };

  const [editLoad, setEditLoad] = useState(false);

  const editCourse = async (courseData: { id: string; formData: FormData }) => {
    const { id: targetId, formData } = courseData;

    if (!targetId) {
      toast.error("Course ID is required for editing");
      return;
    }

    if (!(formData instanceof FormData)) {
      toast.error("Invalid payload: expected FormData");
      return;
    }

    setEditLoad(true);
    try {
      const response = await axios.patch(`${apis.course}/${targetId}`, formData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Course updated successfully");
        router.replace("/short-courses");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string; error?: any }>;
      console.error("BACKEND ERROR DETAILS:", err.response?.data);
      const backendError = err.response?.data?.error;
      const errorMsg = backendError
        ? JSON.stringify(backendError, null, 2)
        : err.response?.data?.message || "Something went wrong while updating the course";

      alert(`Backend Error:\n\n${errorMsg}`);
      toast.error(err.response?.data?.message || "Error updating course");
    } finally {
      setEditLoad(false);
    }
  };


  const [fetched, setFetched] = useState<CourseI[]>([]);
  const [loadFetch, setLoadFetch] = useState(true);

  const fetchCourses = async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${apis.course}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Map _id to id if MongoDB is used
        const rawData = response.data?.data || response.data || [];
        const dataArray = Array.isArray(rawData) ? rawData : [];
        const data = dataArray.map((item: any) => ({
          ...item,
          id: item._id || item.id,
        }));
        setFetched(data);
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong while fetching courses");
    } finally {
      setLoadFetch(false);
    }
  };

  const [delCourseLoad, setDelCourseLoad] = useState(false);

  const deleteCourse = async (id: string) => {
    try {
      setDelCourseLoad(true);
      const token = Cookies.get("accessToken");
      const response = await axios.delete(`${apis.course}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setDeleteModal(false);
        fetchCourses();
        toast.success("Course deleted successfully");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong while deleting");
    } finally {
      setDelCourseLoad(false);
    }
  };
  
  return {
    createCourse,
    loading,
    courses,
    editLoad,
    editCourse,
    loadFetch,
    fetched,
    fetchCourses,
    delCourseLoad,
    deleteCourse,
    setDeleteModal,
    openDeleteModal,
    router
  };
};
