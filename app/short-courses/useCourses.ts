import { createAxiosInstance } from "@/lib/axios";
import { apis } from "@/lib/endpoints";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface CourseI {
  id?: string;
  name: string;
  category?: string;
  difficulty?: string;
  description?: string;
  link?: string; // previously startLearningLink
  isFree?: boolean;
  price?: number | null;
  regularPrice?: string;
  discountedPrice?: string;
  duration?: string;
  certificate?: boolean;
  thumbnail?: string;
  status?: "Published" | "Draft";
  enrollment?: number;
  createdAt?: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [loading, setLoading] = useState(false);
  const axios = createAxiosInstance();
  const router = useRouter();
  const [openDeleteModal, setDeleteModal] = useState(false);

  const createCourse = async (courseData: CourseI) => {
    setLoading(true);
    try {
      const token = Cookies.get("accessToken");

      const response = await axios.post(`${apis.course}`, courseData);

      if (response.status === 200 || response.status === 201) {
        toast.success(`Course ${courseData.status === "Published" ? "published" : "saved as draft"} successfully!`);
        setCourses((prev) => [...prev, courseData]);
        router.replace("/short-courses");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong while creating the course");
    } finally {
      setLoading(false);
    }
  };

  const [editLoad, setEditLoad] = useState(false);

  const editCourse = async (courseData: CourseI) => {
    if (!courseData.id && !(courseData as any)._id) {
      toast.error("Course ID is required for editing");
      return;
    }

    const targetId = courseData.id || (courseData as any)._id;

    setEditLoad(true);
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.patch(`${apis.course}/${targetId}`, courseData);

      if (response.status === 200) {
        toast.success("Course updated successfully");
        router.replace("/short-courses");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong while updating the course");
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
        const data = response.data.data.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          // Fallback parsing for fields if they are somehow stored in a stringified JSON
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
