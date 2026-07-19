import { createAxiosInstance } from "@/lib/axios";
import { apis } from "@/lib/endpoints";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { userI } from "@/props.types";

export const useAllUsers = () => {
  const [users, setUsers] = useState<userI[]>([]);
  const [loading, setLoading] = useState(true);
  const axios = createAxiosInstance();

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${apis.admin}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUsers(Array.isArray(response.data?.data) ? response.data.data : []);
        setLoading(false);
        // toast.success("Users fetched Successfully");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [loadStats, setLoadStats] = useState(true);
  const [stats, setStats] = useState<any>({})
  const fetchStats = async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${apis.stats}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setStats(response.data.data);
        setLoadStats(false);
        // toast.success("Users fetched Successfully");
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchUsers,
    loading,
    users,
    loadStats,
    stats,
    fetchStats
  };
};
