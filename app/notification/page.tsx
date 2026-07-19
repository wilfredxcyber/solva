"use client";
import React, { useEffect, useState } from "react";
import SideNav from "@/components/sideNav";
import Button from "@/components/button";
import { createAxiosInstance } from "@/lib/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [openEditModal, setEditModal] = useState(false);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const axios = createAxiosInstance();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/notification/admin/all");
      if (res.status === 200) {
        setNotifications(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message || "Failed to fetch notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    try {
      setAddLoading(true);
      await axios.post("/notification/broadcast", { title, message });
      toast.success("Notification added");
      setTitle("");
      setMessage("");
      fetchNotifications();
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Failed to add notification");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedNotification) return;
    try {
      setEditLoading(true);
      await axios.patch(`/notification/edit/${selectedNotification.id}`, {
        title,
        message,
      });
      toast.success("Notification updated");
      setEditModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message || "Failed to update notification",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`/notification/delete/${selectedNotification.id}`);
      toast.success("Notification deleted");
      setDeleteModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message || "Failed to delete notification",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-8 bg-gray-50 h-screen overflow-y-scroll">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Notifications</h1>

      {/* Add Notification Form */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add Notification
        </h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Message"
          className="w-full mb-3 p-3 border border-gray-300 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-primary transition"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          BtnText={addLoading ? "Adding..." : "Add Notification"}
          BtnFunction={handleAdd}
          disabled={addLoading}
        />
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No notifications yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition relative"
            >
              <h3 className="font-semibold text-lg text-gray-800">
                {notif.title}
              </h3>
              <p className="text-gray-600 mt-2">{notif.message}</p>
              <p className="text-gray-400 text-sm mt-3">
                {new Date(notif.createdAt).toLocaleString()}
              </p>

              <div className="absolute top-3 right-3 flex gap-3">
                <RiEdit2Line
                  className="text-primary cursor-pointer hover:scale-110 transition"
                  onClick={() => {
                    setSelectedNotification(notif);
                    setTitle(notif.title);
                    setMessage(notif.message);
                    setEditModal(true);
                  }}
                />
                <RiDeleteBin6Line
                  className="text-red-500 cursor-pointer hover:scale-110 transition"
                  onClick={() => {
                    setSelectedNotification(notif);
                    setDeleteModal(true);
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {openEditModal && (
          <Modal
            title="Edit Notification"
            confirmText={editLoading ? "Updating..." : "Update"}
            onClose={() => setEditModal(false)}
            onConfirm={handleEdit}
            disabled={editLoading}
          >
            <input
              type="text"
              className="w-full mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full mb-3 p-3 border border-gray-300 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {openDeleteModal && (
          <Modal
            title="Confirm Delete"
            confirmText={deleteLoading ? "Deleting..." : "Delete"}
            onClose={() => setDeleteModal(false)}
            onConfirm={handleDelete}
            danger
            disabled={deleteLoading}
          >
            <p className="text-gray-600 text-center">
              Are you sure you want to delete this notification? <br />
              <span className="font-semibold">
                This action is irreversible.
              </span>
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Reusable Modal Component */
const Modal = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText,
  danger,
  disabled,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="bg-white p-6 rounded-2xl w-96 mx-3 shadow-lg"
    >
      <h2 className="font-bold text-xl mb-4 text-center">{title}</h2>
      {children}
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          disabled={disabled}
          className={`flex-1 py-2 rounded-xl text-white transition ${
            danger
              ? "bg-red-500 hover:bg-red-600 disabled:bg-red-400"
              : "bg-primary hover:bg-primary/90 disabled:bg-primary/70"
          }`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default Notifications;
