"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus, ChevronLeft, ChevronRight } from "lucide-react";

type Course = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  enrollment: number;
  status: "Published" | "Draft";
  thumbnail: string;
};

// Initial mock data if empty
const mockCourses: Course[] = [
  {
    id: "1",
    name: "Smartphone Video Editing",
    category: "Marketing",
    price: null,
    enrollment: 450,
    status: "Published",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=80&h=80&fit=crop",
  },
  {
    id: "2",
    name: "Digital Marketing",
    category: "Marketing",
    price: 45000,
    enrollment: 320,
    status: "Published",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=80&fit=crop",
  },
  {
    id: "3",
    name: "Coding for Beginners",
    category: "Coding",
    price: 60000,
    enrollment: 580,
    status: "Published",
    thumbnail: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=80&h=80&fit=crop",
  },
  {
    id: "4",
    name: "Graphic Design",
    category: "Design",
    price: 35000,
    enrollment: 100,
    status: "Draft",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=80&h=80&fit=crop",
  },
];

const ITEMS_PER_PAGE = 5;

const ShortCourses = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Published" | "Draft">("Published");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Load courses from localStorage
    const stored = localStorage.getItem("solva_courses");
    if (stored) {
      setCourses(JSON.parse(stored));
    } else {
      setCourses(mockCourses);
      localStorage.setItem("solva_courses", JSON.stringify(mockCourses));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      const updated = courses.filter((c) => c.id !== id);
      setCourses(updated);
      localStorage.setItem("solva_courses", JSON.stringify(updated));
    }
    setOpenMenuId(null);
  };

  const handlePublishToggle = (id: string) => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        return { ...c, status: c.status === "Published" ? "Draft" : "Published" } as Course;
      }
      return c;
    });
    setCourses(updated);
    localStorage.setItem("solva_courses", JSON.stringify(updated));
    setOpenMenuId(null);
  };

  const filteredCourses = courses.filter((c) => c.status === activeTab);
  const TOTAL_ENTRIES = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(TOTAL_ENTRIES / ITEMS_PER_PAGE));

  // Reset pagination if out of bounds when switching tabs
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [activeTab, totalPages, currentPage]);

  const startEntry = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_ENTRIES);
  
  const currentItems = filteredCourses.slice(startEntry - 1, endEntry);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Free";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Free";
    return `₦${numPrice.toLocaleString()}`;
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const renderDesktopRow = (course: Course) => (
    <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <img src={course.thumbnail} alt={course.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          <span className="font-semibold text-gray-900 text-sm max-w-[200px] truncate" title={course.name}>{course.name}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">{course.category}</span>
      </td>
      <td className="py-4 px-6">
        <span className="text-gray-800 font-medium text-sm">{formatPrice(course.price)}</span>
      </td>
      <td className="py-4 px-6">
        <span className="text-gray-700 text-sm">{(course.enrollment || 0).toLocaleString()}</span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${course.status === "Published" ? "bg-green-500" : "bg-gray-400"}`} />
          <span className={`text-sm font-medium ${course.status === "Published" ? "text-green-600" : "text-gray-500"}`}>{course.status}</span>
        </div>
      </td>
      <td className="py-4 px-6 relative">
        <button onClick={(e) => { e.stopPropagation(); toggleMenu(course.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <MoreVertical className="w-5 h-5" />
        </button>
        {openMenuId === course.id && (
          <div className="absolute right-6 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => router.push(`/short-courses/${course.id}`)}>Edit Course</button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => handlePublishToggle(course.id)}>{course.status === "Published" ? "Unpublish" : "Publish"}</button>
            <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors" onClick={() => handleDelete(course.id)}>Delete</button>
          </div>
        )}
      </td>
    </tr>
  );

  const renderMobileCard = (course: Course) => (
    <div key={course.id} className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={course.thumbnail} alt={course.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate" title={course.name}>{course.name}</p>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mt-1">{course.category}</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); toggleMenu(course.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <MoreVertical className="w-5 h-5" />
          </button>
          {openMenuId === course.id && (
            <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => router.push(`/short-courses/${course.id}`)}>Edit Course</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => handlePublishToggle(course.id)}>{course.status === "Published" ? "Unpublish" : "Publish"}</button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50" onClick={() => handleDelete(course.id)}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pl-[60px]">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{formatPrice(course.price)}</span>
          <span>·</span>
          <span>{(course.enrollment || 0).toLocaleString()} Students</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${course.status === "Published" ? "bg-green-500" : "bg-gray-400"}`} />
          <span className={`text-xs font-medium ${course.status === "Published" ? "text-green-600" : "text-gray-500"}`}>{course.status}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-4 sm:p-8 overflow-y-auto min-h-screen bg-gray-50" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="bg-primary rounded-2xl p-5 sm:p-8 text-white shadow-md mb-6">
        <h1 className="font-semibold text-xl sm:text-3xl">Learn Courses</h1>
        <p className="text-sm sm:text-xl font-light mt-1">
          Manage your active curriculum and course listings.
        </p>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
          <button
            onClick={() => { setActiveTab("Published"); setCurrentPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "Published"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => { setActiveTab("Draft"); setCurrentPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "Draft"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Drafts
          </button>
        </div>
        <button
          onClick={() => router.push("/short-courses/create")}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Active Curriculum Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        {/* Card Header */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{activeTab} Courses</h2>
          <span className="ml-3 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {TOTAL_ENTRIES}
          </span>
        </div>

        {TOTAL_ENTRIES === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No {activeTab.toLowerCase()} courses found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto min-h-[300px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Name</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrollment</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(renderDesktopRow)}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {currentItems.map(renderMobileCard)}
            </div>

            {/* Pagination Footer */}
            {TOTAL_ENTRIES > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
                <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Showing {TOTAL_ENTRIES === 0 ? 0 : startEntry} to {endEntry} of {TOTAL_ENTRIES} entries
                </p>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    // Try to center the current page
                    let pageNum = currentPage;
                    if (currentPage === 1) pageNum = i + 1;
                    else if (currentPage === totalPages) pageNum = totalPages - 2 + i + 1;
                    else pageNum = currentPage - 1 + i;
                    
                    // Constrain
                    pageNum = Math.max(1, Math.min(pageNum, totalPages));
                    return pageNum;
                  }).filter((v, i, a) => a.indexOf(v) === i).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShortCourses;
