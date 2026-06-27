"use client";
import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useScholar } from "./useSchola";
import { useGrants } from "../grants/useGrants";

type Tab = "scholarships" | "grants";

const ScholarshipsAndGrants = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("scholarships");

  // Scholarship state
  const {
    loadFetch: loadScholar,
    fetched: scholarships,
    fetchScholar,
    delGrant: delScholar,
    deleteGrant: deleteScholar,
    setDeleteModal: setScholarDeleteModal,
    openDeleteModal: openScholarDeleteModal,
  } = useScholar();

  // Grants state
  const {
    loadFetch: loadGrants,
    fetched: grants,
    fetchGrants,
    delGrant,
    deleteGrant,
    setDeleteModal: setGrantDeleteModal,
    openDeleteModal: openGrantDeleteModal,
  } = useGrants();

  const [selectedScholar, setSelectedScholar] = useState<string | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null);

  useEffect(() => {
    fetchScholar();
    fetchGrants();
  }, []);

  const tabs = [
    { key: "scholarships" as Tab, label: "Scholarships" },
    { key: "grants" as Tab, label: "Grants" },
  ];

  const renderTable = (
    data: any[],
    loading: boolean,
    emptyMsg: string,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  ) => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            <th className="font-semibold text-sm py-3 px-4 text-center">Link</th>
            <th className="font-semibold text-sm py-3 px-4 text-center">Date</th>
            <th className="font-semibold text-sm py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-10 text-gray-400 italic text-sm">
                No {activeTab} found
              </td>
            </tr>
          ) : (
            data.map((item: any) => (
              <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-center">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline hover:text-primary/80 break-all text-sm"
                  >
                    {item.link}
                  </a>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 text-sm">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <CiEdit
                      onClick={() => onEdit(item.id)}
                      className="text-gray-600 hover:text-primary text-xl cursor-pointer transition"
                    />
                    <RiDeleteBin2Line
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-600 text-xl cursor-pointer transition"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full p-5 sm:p-10 overflow-y-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary rounded-2xl p-5 sm:p-8 text-white shadow-md mb-6">
        <h1 className="font-semibold text-xl sm:text-3xl">Scholarships & Grants</h1>
        <p className="text-sm sm:text-lg font-light mt-1">
          Manage scholarship and grant opportunities for students.
        </p>
      </div>

      {/* Tab bar + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() =>
            router.push(
              activeTab === "scholarships"
                ? "/scholarships/add-scholarship"
                : "/grants/add-grants"
            )
          }
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl shadow-sm transition text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
        >
          <IoIosAddCircleOutline className="text-xl" />
          Add New {activeTab === "scholarships" ? "Scholarship" : "Grant"}
        </button>
      </div>

      {/* Table */}
      {activeTab === "scholarships"
        ? renderTable(
            scholarships,
            loadScholar,
            "No scholarships found",
            (id) => router.push(`/scholarships/${id}`),
            (id) => {
              setSelectedScholar(id);
              setScholarDeleteModal(true);
            }
          )
        : renderTable(
            grants,
            loadGrants,
            "No grants found",
            (id) => router.push(`/grants/${id}`),
            (id) => {
              setSelectedGrant(id);
              setGrantDeleteModal(true);
            }
          )}

      {/* Delete Modal — Scholarship */}
      {openScholarDeleteModal && selectedScholar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="w-11/12 max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this scholarship?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setScholarDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteScholar(selectedScholar)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition"
              >
                {delScholar ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal — Grant */}
      {openGrantDeleteModal && selectedGrant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="w-11/12 max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this grant?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGrantDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGrant(selectedGrant)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition"
              >
                {delGrant ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsAndGrants;
