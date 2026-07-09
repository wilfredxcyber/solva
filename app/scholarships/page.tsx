"use client";
import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useScholar } from "./useSchola";

const ScholarshipsAndGrants = () => {
  const router = useRouter();

  // Unified Scholarship/Grant state
  const {
    loadFetch,
    fetched: items,
    fetchScholar,
    delGrant: delItem,
    deleteGrant: deleteItem,
    setDeleteModal: setItemDeleteModal,
    openDeleteModal: openItemDeleteModal,
  } = useScholar();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchScholar();
  }, []);

  const renderTable = () => (
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
          {loadFetch ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-10 text-gray-400 italic text-sm">
                No items found
              </td>
            </tr>
          ) : (
            items.map((item: any) => (
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
                      onClick={() => router.push(`/scholarships/${item.id}`)}
                      className="text-gray-600 hover:text-primary text-xl cursor-pointer transition"
                    />
                    <RiDeleteBin2Line
                      onClick={() => {
                        setSelectedItem(item.id);
                        setItemDeleteModal(true);
                      }}
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

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-5">
        {/* Add button */}
        <button
          onClick={() => router.push("/scholarships/add-scholarship")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl shadow-sm transition text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
        >
          <IoIosAddCircleOutline className="text-xl" />
          Add Scholarship/Grant
        </button>
      </div>

      {/* Table */}
      {renderTable()}

      {/* Delete Modal */}
      {openItemDeleteModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="w-11/12 max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this item?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteItem(selectedItem)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition"
              >
                {delItem ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsAndGrants;
