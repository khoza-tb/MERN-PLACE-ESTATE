import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  User,
  MapPin,
  CalendarDays,
  Clock3,
  CircleDot,
  Reply,
  Inbox,
  Filter,
  Send,
} from "lucide-react";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [deleteInquiry, setDeleteInquiry] = useState(null);
  const [deletingInquiryId, setDeletingInquiryId] = useState(null);

  // =========================================================
  // REPLY STATE
  // =========================================================

  const [replyInquiry, setReplyInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // =========================================================
  // IMAGE HELPER
  // =========================================================

  const getImageUrl = (image) => {
    const fallback =
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

    if (!image || typeof image !== "string") {
      return fallback;
    }

    const markdownMatch = image.match(/\((https?:\/\/[^)\s]+)/);

    if (markdownMatch?.[1]) {
      return markdownMatch[1];
    }

    const normalMatch = image.match(/https?:\/\/[^\s\])"]+/);

    if (normalMatch?.[0]) {
      return normalMatch[0];
    }

    return fallback;
  };

  // =========================================================
  // SAFE RESPONSE PARSER
  // =========================================================

  const getResponseData = async (response) => {
    const text = await response.text();

    if (!text || !text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("INVALID JSON RESPONSE:", text);

      return {
        message: "The server returned an invalid response.",
      };
    }
  };

  // =========================================================
  // FETCH INQUIRIES
  // =========================================================

  const fetchInquiries = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/inquiries", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      console.log("ADMIN INQUIRIES STATUS:", response.status);
      console.log("ADMIN INQUIRIES DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load inquiries. Server returned ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load inquiries."
        );
      }

      const inquiryList = Array.isArray(data.inquiries)
        ? data.inquiries
        : [];

      setInquiries(inquiryList);
    } catch (error) {
      console.error("FETCH ADMIN INQUIRIES ERROR:", error);

      setError(
        error.message || "Failed to load inquiries."
      );

      if (!isRefresh) {
        setInquiries([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchInquiries();
  }, []);

  // =========================================================
  // CLEAR SUCCESS
  // =========================================================

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (inquiryId, status) => {
    try {
      setUpdatingInquiryId(inquiryId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/inquiries/${inquiryId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await getResponseData(response);

      console.log("STATUS UPDATE:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update inquiry status."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Failed to update inquiry status."
        );
      }

      const newStatus = data.inquiry?.status || status;

      setInquiries((previousInquiries) =>
        previousInquiries.map((inquiry) =>
          inquiry._id === inquiryId
            ? {
                ...inquiry,
                status: newStatus,
              }
            : inquiry
        )
      );

      setSelectedInquiry((previous) =>
        previous?._id === inquiryId
          ? {
              ...previous,
              status: newStatus,
            }
          : previous
      );

      setSuccess(`Inquiry marked as ${newStatus}.`);
    } catch (error) {
      console.error(
        "UPDATE INQUIRY STATUS ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while updating the inquiry."
      );
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  // =========================================================
  // OPEN REPLY MODAL
  // =========================================================

  const openReplyModal = (inquiry) => {
    setError("");
    setSuccess("");
    setReplyInquiry(inquiry);
    setReplyMessage("");
  };

  // =========================================================
  // CLOSE REPLY MODAL
  // =========================================================

  const closeReplyModal = () => {
    if (sendingReply) return;

    setReplyInquiry(null);
    setReplyMessage("");
  };

  // =========================================================
  // SEND REPLY
  // =========================================================

    
const handleSendReply = async () => {
  if (!replyInquiry) return;

  const cleanMessage = replyMessage.trim();

  if (!cleanMessage) {
    setError("Please enter a reply message.");
    return;
  }

  if (cleanMessage.length < 2) {
    setError("Your reply is too short.");
    return;
  }

  // Get the inquiry ID without changing anything in the UI
  const inquiryId =
    replyInquiry?._id ||
    replyInquiry?.id ||
    replyInquiry?.inquiryId;

  // MongoDB ObjectId must be 24 hexadecimal characters
  if (
    !inquiryId ||
    !/^[0-9a-fA-F]{24}$/.test(String(inquiryId))
  ) {
    console.error("INVALID INQUIRY OBJECT:", replyInquiry);
    setError("Invalid inquiry ID. Please close and open the inquiry again.");
    return;
  }

  try {
    setSendingReply(true);
    setError("");
    setSuccess("");

    const response = await fetch(
      `/api/inquiry/reply/${String(inquiryId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: cleanMessage,
        }),
      }
    );

    const data = await getResponseData(response);

    console.log("REPLY RESPONSE:", response.status, data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to send reply."
      );
    }

    if (!data.success) {
      throw new Error(
        data.message || "Failed to send reply."
      );
    }

    const updatedInquiry = data.inquiry;

    // Update the inquiry in the existing list
    setInquiries((previousInquiries) =>
      previousInquiries.map((inquiry) => {
        const existingId =
          inquiry?._id ||
          inquiry?.id ||
          inquiry?.inquiryId;

        return String(existingId) === String(inquiryId)
          ? {
              ...inquiry,
              ...(updatedInquiry || {}),
              status: "replied",
            }
          : inquiry;
      })
    );

    // Update selected inquiry if it is currently open
    setSelectedInquiry((previous) => {
      if (!previous) return previous;

      const previousId =
        previous?._id ||
        previous?.id ||
        previous?.inquiryId;

      return String(previousId) === String(inquiryId)
        ? {
            ...previous,
            ...(updatedInquiry || {}),
            status: "replied",
          }
        : previous;
    });

    // Clear reply form
    setReplyMessage("");

    // CLOSE THE REPLY UI AFTER SUCCESSFUL REPLY
    setReplyInquiry(null);

    setSuccess(
      data.message || "Reply sent successfully."
    );
  } catch (error) {
    console.error(
      "SEND INQUIRY REPLY ERROR:",
      error
    );

    setError(
      error.message ||
        "Something went wrong while sending the reply."
    );
  } finally {
    setSendingReply(false);
  }
};

  // =========================================================
  // DELETE INQUIRY
  // =========================================================

  const handleDeleteInquiry = async () => {
    if (!deleteInquiry) return;

    try {
      setDeletingInquiryId(deleteInquiry._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/inquiries/${deleteInquiry._id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await getResponseData(response);

      console.log("DELETE INQUIRY:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete inquiry."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Failed to delete inquiry."
        );
      }

      setInquiries((previousInquiries) =>
        previousInquiries.filter(
          (inquiry) =>
            inquiry._id !== deleteInquiry._id
        )
      );

      if (
        selectedInquiry?._id ===
        deleteInquiry._id
      ) {
        setSelectedInquiry(null);
      }

      if (
        replyInquiry?._id ===
        deleteInquiry._id
      ) {
        setReplyInquiry(null);
        setReplyMessage("");
      }

      setSuccess(
        data.message ||
          "Inquiry deleted successfully."
      );

      setDeleteInquiry(null);
    } catch (error) {
      console.error(
        "DELETE INQUIRY ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while deleting the inquiry."
      );
    } finally {
      setDeletingInquiryId(null);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredInquiries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const senderName =
        inquiry.senderId?.username ||
        inquiry.name ||
        "";

      const senderEmail =
        inquiry.senderId?.email ||
        inquiry.email ||
        "";

      const listingName =
        inquiry.listingId?.name ||
        "";

      const listingAddress =
        inquiry.listingId?.address ||
        "";

      const message =
        inquiry.message ||
        "";

      const matchesSearch =
        !search ||
        senderName
          .toLowerCase()
          .includes(search) ||
        senderEmail
          .toLowerCase()
          .includes(search) ||
        listingName
          .toLowerCase()
          .includes(search) ||
        listingAddress
          .toLowerCase()
          .includes(search) ||
        message
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        inquiry.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    inquiries,
    searchTerm,
    statusFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const newCount = inquiries.filter(
    (inquiry) =>
      inquiry.status === "new"
  ).length;

  const readCount = inquiries.filter(
    (inquiry) =>
      inquiry.status === "read"
  ).length;

  const repliedCount = inquiries.filter(
    (inquiry) =>
      inquiry.status === "replied"
  ).length;

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // RELATIVE DATE
  // =========================================================

  const getRelativeDate = (date) => {
    if (!date) return "";

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      created.getTime();

    if (difference < 0) {
      return formatDate(date);
    }

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes !== 1 ? "s" : ""
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;
    }

    if (days < 30) {
      return `${days} day${
        days !== 1 ? "s" : ""
      } ago`;
    }

    return formatDate(date);
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    if (status === "new") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">
          <CircleDot size={13} />
          New
        </span>
      );
    }

    if (status === "read") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          <Eye size={13} />
          Read
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
        <Reply size={13} />
        Replied
      </span>
    );
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />

              <div>
                <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />

                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                <div className="mt-2 h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>

          <div className="mb-6 h-28 animate-pulse rounded-2xl bg-white dark:bg-gray-900" />

          <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse border-b border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
              />
            ))}
          </div>

        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 shadow-sm dark:bg-green-950/40">
                <MessageSquare
                  size={25}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Manage Inquiries
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Customer communication
                </p>
              </div>

            </div>

            <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Review property inquiries, manage statuses and keep track of customer conversations.
            </p>
          </div>

          <button
            onClick={() => fetchInquiries(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Inquiries"}
          </button>

        </div>

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900 dark:bg-green-950/30">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
              <CheckCircle
                size={19}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Action completed
              </p>

              <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
                {success}
              </p>
            </div>

            <button
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/30">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
              <AlertCircle
                size={19}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100 transition group-hover:scale-125 dark:bg-gray-800" />

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <Inbox
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Inquiries
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {inquiries.length}
              </p>
            </div>

          </div>

          {/* NEW */}

          <div className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-green-950/60 dark:bg-gray-900">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-50 transition group-hover:scale-125 dark:bg-green-950/30" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/50">
                  <CircleDot
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>

                {newCount > 0 && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    Attention
                  </span>
                )}

              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                New
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
                {newCount}
              </p>

            </div>
          </div>

          {/* READ */}

          <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-blue-950/60 dark:bg-gray-900">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-125 dark:bg-blue-950/30" />

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                <Eye
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Read
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {readCount}
              </p>

            </div>
          </div>

          {/* REPLIED */}

          <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-purple-950/60 dark:bg-gray-900">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-50 transition group-hover:scale-125 dark:bg-purple-950/30" />

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50">
                <Reply
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Replied
              </p>

              <p className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">
                {repliedCount}
              </p>

            </div>
          </div>

        </div>

        {/* ===================================================
            FILTER
        =================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">

            <div className="flex items-center gap-2">

              <Filter
                size={18}
                className="text-gray-500"
              />

              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Filter Inquiries
              </h2>

              {hasActiveFilters && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Active
                </span>
              )}

            </div>
          </div>

          <div className="p-5">

            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  placeholder="Search by customer, email, property or message..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                {searchTerm && (
                  <button
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="new">
                  New
                </option>

                <option value="read">
                  Read
                </option>

                <option value="replied">
                  Replied
                </option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={16} />
                  Clear
                </button>
              )}

            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">

              <span>
                Showing{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {filteredInquiries.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {inquiries.length}
                </span>{" "}
                inquiries
              </span>

              {newCount > 0 && (
                <span className="hidden items-center gap-1.5 text-green-600 sm:flex dark:text-green-400">
                  <CircleDot size={14} />
                  {newCount} require attention
                </span>
              )}

            </div>

          </div>
        </div>

        {/* ===================================================
            DESKTOP TABLE
        =================================================== */}

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:block">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400">

                  <th className="px-6 py-4 font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Property
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Message
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Received
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredInquiries.map(
                  (inquiry) => {
                    const senderName =
                      inquiry.senderId?.username ||
                      inquiry.name ||
                      "Unknown Customer";

                    const senderEmail =
                      inquiry.senderId?.email ||
                      inquiry.email ||
                      "";

                    const listingName =
                      inquiry.listingId?.name ||
                      "Property";

                    return (
                      <tr
                        key={inquiry._id}
                        className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            {inquiry.senderId?.avatar ? (
                              <img
                                src={
                                  inquiry.senderId.avatar
                                }
                                alt={senderName}
                                className="h-11 w-11 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                                <User size={19} />
                              </div>
                            )}

                            <div className="min-w-0">

                              <p className="max-w-40 truncate font-semibold text-gray-900 dark:text-white">
                                {senderName}
                              </p>

                              <p className="mt-1 flex max-w-48 items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                <Mail size={12} />
                                {senderEmail}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* PROPERTY */}

                        <td className="px-6 py-5">

                          <div className="flex max-w-52 items-center gap-3">

                            <img
                              src={getImageUrl(
                                inquiry.listingId?.imageUrls?.[0]
                              )}
                              alt={listingName}
                              className="h-12 w-14 shrink-0 rounded-lg object-cover"
                            />

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {listingName}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">

                                <MapPin size={12} />

                                <span className="truncate">
                                  {inquiry.listingId?.address ||
                                    "Address unavailable"}
                                </span>

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* MESSAGE */}

                        <td className="px-6 py-5">

                          <p className="line-clamp-2 max-w-64 text-sm leading-5 text-gray-600 dark:text-gray-300">
                            {inquiry.message ||
                              "No message provided."}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <div className="flex flex-col items-start gap-2">

                            {getStatusBadge(
                              inquiry.status
                            )}

                            <select
                              value={
                                inquiry.status ||
                                "new"
                              }
                              disabled={
                                updatingInquiryId ===
                                inquiry._id
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  inquiry._id,
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-green-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >

                              <option value="new">
                                New
                              </option>

                              <option value="read">
                                Read
                              </option>

                              <option value="replied">
                                Replied
                              </option>

                            </select>

                            {updatingInquiryId ===
                              inquiry._id && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                                Updating...
                              </span>
                            )}

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">

                            <Clock3 size={14} />

                            <div>
                              <p>
                                {getRelativeDate(
                                  inquiry.createdAt
                                )}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-400">
                                {formatDate(
                                  inquiry.createdAt
                                )}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5 text-right">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openReplyModal(
                                  inquiry
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                              title="Reply to customer"
                            >
                              <Reply size={15} />
                              Reply
                            </button>

                            <button
                              onClick={() =>
                                setSelectedInquiry(
                                  inquiry
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              onClick={() =>
                                setDeleteInquiry(
                                  inquiry
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                              title="Delete inquiry"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {filteredInquiries.length === 0 && (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
          )}

        </div>

        {/* ===================================================
            MOBILE
        =================================================== */}

        <div className="space-y-4 md:hidden">

          {filteredInquiries.map(
            (inquiry) => {
              const senderName =
                inquiry.senderId?.username ||
                inquiry.name ||
                "Unknown Customer";

              const senderEmail =
                inquiry.senderId?.email ||
                inquiry.email ||
                "";

              const listingName =
                inquiry.listingId?.name ||
                "Property";

              return (
                <article
                  key={inquiry._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800">

                    <div className="flex min-w-0 items-center gap-3">

                      {inquiry.senderId?.avatar ? (
                        <img
                          src={
                            inquiry.senderId.avatar
                          }
                          alt={senderName}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                          <User size={18} />
                        </div>
                      )}

                      <div className="min-w-0">

                        <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                          {senderName}
                        </h3>

                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {senderEmail}
                        </p>

                      </div>

                    </div>

                    {getStatusBadge(
                      inquiry.status
                    )}

                  </div>

                  {/* PROPERTY */}

                  <div className="p-4">

                    <div className="flex gap-3">

                      <img
                        src={getImageUrl(
                          inquiry.listingId?.imageUrls?.[0]
                        )}
                        alt={listingName}
                        className="h-20 w-24 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0">

                        <p className="font-semibold text-gray-900 dark:text-white">
                          {listingName}
                        </p>

                        <p className="mt-1 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">

                          <MapPin
                            size={13}
                            className="mt-0.5 shrink-0"
                          />

                          <span className="line-clamp-2">
                            {inquiry.listingId?.address ||
                              "Address unavailable"}
                          </span>

                        </p>

                      </div>

                    </div>

                    {/* MESSAGE */}

                    <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">

                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Message
                      </p>

                      <p className="line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {inquiry.message ||
                          "No message provided."}
                      </p>

                    </div>

                    {/* DATE */}

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">

                      <span className="flex items-center gap-1.5">

                        <CalendarDays size={14} />

                        {formatDate(
                          inquiry.createdAt
                        )}

                      </span>

                      <span>
                        {getRelativeDate(
                          inquiry.createdAt
                        )}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-4 grid grid-cols-2 gap-2">

                      <button
                        onClick={() =>
                          openReplyModal(
                            inquiry
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        <Reply size={16} />
                        Reply
                      </button>

                      <button
                        onClick={() =>
                          setSelectedInquiry(
                            inquiry
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2">

                      <select
                        value={
                          inquiry.status ||
                          "new"
                        }
                        disabled={
                          updatingInquiryId ===
                          inquiry._id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            inquiry._id,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-700 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      >

                        <option value="new">
                          New
                        </option>

                        <option value="read">
                          Read
                        </option>

                        <option value="replied">
                          Replied
                        </option>

                      </select>

                    </div>

                    <button
                      onClick={() =>
                        setDeleteInquiry(
                          inquiry
                        )
                      }
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={15} />
                      Delete Inquiry
                    </button>

                  </div>

                </article>
              );
            }
          )}

          {filteredInquiries.length === 0 && (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
          )}

        </div>
      </div>

      {/* =====================================================
          VIEW INQUIRY MODAL
      ===================================================== */}

      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() =>
            setSelectedInquiry(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40">
                    <MessageSquare
                      size={21}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Inquiry Details
                    </h2>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customer communication
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedInquiry(null)
                  }
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>

              </div>

            </div>

            <div className="space-y-5 p-6">

              {/* CUSTOMER */}

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/50">

                <div className="mb-4 flex items-center gap-2">

                  <User
                    size={17}
                    className="text-gray-500"
                  />

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Customer
                  </h3>

                </div>

                <div className="flex items-center gap-4">

                  {selectedInquiry.senderId?.avatar ? (
                    <img
                      src={
                        selectedInquiry.senderId.avatar
                      }
                      alt={
                        selectedInquiry.senderId?.username ||
                        selectedInquiry.name
                      }
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                      <User size={24} />
                    </div>
                  )}

                  <div className="min-w-0">

                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedInquiry.senderId?.username ||
                        selectedInquiry.name ||
                        "Unknown Customer"}
                    </p>

                    <a
                      href={`mailto:${
                        selectedInquiry.senderId?.email ||
                        selectedInquiry.email ||
                        ""
                      }`}
                      className="mt-1 flex items-center gap-2 text-sm text-green-600 hover:underline dark:text-green-400"
                    >
                      <Mail size={14} />

                      {selectedInquiry.senderId?.email ||
                        selectedInquiry.email ||
                        "No email"}
                    </a>

                    {selectedInquiry.phone && (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="mt-1 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <Phone size={14} />

                        {selectedInquiry.phone}
                      </a>
                    )}

                  </div>

                </div>

              </section>

              {/* PROPERTY */}

              <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

                <div className="overflow-hidden rounded-t-2xl">

                  <img
                    src={getImageUrl(
                      selectedInquiry.listingId?.imageUrls?.[0]
                    )}
                    alt={
                      selectedInquiry.listingId?.name ||
                      "Property"
                    }
                    className="h-48 w-full object-cover"
                  />

                </div>

                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Property
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {selectedInquiry.listingId?.name ||
                          "Property"}
                      </h3>

                      <p className="mt-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">

                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        {selectedInquiry.listingId?.address ||
                          "Address unavailable"}

                      </p>

                    </div>

                    {selectedInquiry.listingId?._id && (
                      <Link
                        to={`/listing/${selectedInquiry.listingId._id}`}
                        onClick={() =>
                          setSelectedInquiry(null)
                        }
                        className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        View Property
                      </Link>
                    )}

                  </div>

                </div>

              </section>

              {/* MESSAGE */}

              <section>

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Message
                  </h3>

                  {getStatusBadge(
                    selectedInquiry.status
                  )}

                </div>

                <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/70">

                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {selectedInquiry.message ||
                      "No message provided."}
                  </p>

                </div>

              </section>

              {/* QUICK REPLY */}

              <section className="rounded-2xl border border-green-200 bg-green-50/60 p-5 dark:border-green-900/50 dark:bg-green-950/20">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <Reply
                        size={18}
                        className="text-green-600 dark:text-green-400"
                      />

                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Respond to Customer
                      </h3>

                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                      Send a response directly to the customer's email.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      openReplyModal(
                        selectedInquiry
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    <Reply size={17} />
                    Reply to Customer
                  </button>

                </div>

              </section>

              {/* STATUS */}

              <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Inquiry Status
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Update the current state of this inquiry.
                    </p>

                  </div>

                  <select
                    value={
                      selectedInquiry.status ||
                      "new"
                    }
                    disabled={
                      updatingInquiryId ===
                      selectedInquiry._id
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        selectedInquiry._id,
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >

                    <option value="new">
                      New
                    </option>

                    <option value="read">
                      Read
                    </option>

                    <option value="replied">
                      Replied
                    </option>

                  </select>

                </div>

              </section>

              {/* META */}

              <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-5 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">

                <span className="flex items-center gap-1.5">

                  <CalendarDays size={14} />

                  {formatDate(
                    selectedInquiry.createdAt
                  )}

                </span>

                <span className="flex items-center gap-1.5">

                  <Clock3 size={14} />

                  {getRelativeDate(
                    selectedInquiry.createdAt
                  )}

                </span>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REPLY MODAL
      ===================================================== */}

      {replyInquiry && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            if (!sendingReply) {
              closeReplyModal();
            }
          }}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40">

                    <Reply
                      size={21}
                      className="text-green-600 dark:text-green-400"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Reply to Customer
                    </h2>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send an email response
                    </p>

                  </div>

                </div>

                <button
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>

              </div>

            </div>

            <div className="space-y-5 p-6">

              {/* CUSTOMER */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/50">

                <div className="flex items-center gap-4">

                  {replyInquiry.senderId?.avatar ? (
                    <img
                      src={
                        replyInquiry.senderId.avatar
                      }
                      alt={
                        replyInquiry.senderId?.username ||
                        replyInquiry.name
                      }
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                      <User size={24} />
                    </div>
                  )}

                  <div className="min-w-0">

                    <p className="font-bold text-gray-900 dark:text-white">
                      {replyInquiry.senderId?.username ||
                        replyInquiry.name ||
                        "Customer"}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">

                      <Mail size={14} />

                      <span className="truncate">
                        {replyInquiry.senderId?.email ||
                          replyInquiry.email ||
                          "No email address"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* PROPERTY */}

              <div className="flex gap-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">

                <img
                  src={getImageUrl(
                    replyInquiry.listingId?.imageUrls?.[0]
                  )}
                  alt={
                    replyInquiry.listingId?.name ||
                    "Property"
                  }
                  className="h-20 w-24 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0">

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Property
                  </p>

                  <p className="mt-1 truncate font-bold text-gray-900 dark:text-white">
                    {replyInquiry.listingId?.name ||
                      "Property"}
                  </p>

                  <p className="mt-1 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">

                    <MapPin
                      size={13}
                      className="mt-0.5 shrink-0"
                    />

                    <span className="line-clamp-2">
                      {replyInquiry.listingId?.address ||
                        "Address unavailable"}
                    </span>

                  </p>

                </div>

              </div>

              {/* ORIGINAL MESSAGE */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Original Inquiry
                  </h3>

                  <span className="text-xs text-gray-400">
                    {formatDate(
                      replyInquiry.createdAt
                    )}
                  </span>

                </div>

                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/70">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {replyInquiry.message ||
                      "No message provided."}
                  </p>

                </div>

              </div>

              {/* REPLY INPUT */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    Your Reply
                  </label>

                  <span
                    className={`text-xs ${
                      replyMessage.length > 900
                        ? "font-semibold text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    {replyMessage.length}/1000
                  </span>

                </div>

                <textarea
                  value={replyMessage}
                  onChange={(e) =>
                    setReplyMessage(
                      e.target.value
                    )
                  }
                  maxLength={1000}
                  rows={7}
                  autoFocus
                  placeholder="Write your response to the customer..."
                  disabled={sendingReply}
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  The customer will receive this response by email.
                </p>

              </div>

              {/* SEND */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">

                <button
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendReply}
                  disabled={
                    sendingReply ||
                    !replyMessage.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {sendingReply ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Reply
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteInquiry && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => {
            if (deletingInquiryId === null) {
              setDeleteInquiry(null);
            }
          }}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">

                  <Trash2
                    size={22}
                    className="text-red-600 dark:text-red-400"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Delete Inquiry
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Permanent action
                  </p>

                </div>

                <button
                  onClick={() =>
                    setDeleteInquiry(null)
                  }
                  disabled={
                    deletingInquiryId !== null
                  }
                  className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            <div className="p-6">

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">

                    <User size={18} />

                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {deleteInquiry.senderId?.username ||
                        deleteInquiry.name ||
                        "Unknown Customer"}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      {deleteInquiry.listingId?.name ||
                        "Property inquiry"}
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to permanently delete this inquiry? This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  onClick={() =>
                    setDeleteInquiry(null)
                  }
                  disabled={
                    deletingInquiryId !== null
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleDeleteInquiry
                  }
                  disabled={
                    deletingInquiryId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {deletingInquiryId !== null ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={17} />
                      Delete Inquiry
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  hasActiveFilters,
  clearFilters,
}) {
  return (
    <div className="px-6 py-20 text-center">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">

        <MessageSquare
          size={32}
          className="text-gray-400"
        />

      </div>

      <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">

        {hasActiveFilters
          ? "No matching inquiries"
          : "No inquiries yet"}

      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">

        {hasActiveFilters
          ? "No inquiries match your current search or filters. Try adjusting your criteria."
          : "There are currently no property inquiries in the system."}

      </p>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <X size={16} />
          Clear Filters
        </button>
      )}

    </div>
  );
}