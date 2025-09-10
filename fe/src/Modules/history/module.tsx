import React, { useEffect, useState } from "react";
import axios from "axios";
import BaseLayout from "@components/layouts/base";
import { parse, format, parseISO } from "date-fns";

interface ReportData {
  id: number;
  userId: number;
  username: string;
  location: string;
  name: string;
  photo: string;
  submissionTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  position?: string; // Added position to report data
}

interface UserData {
  id: number;
  username: string;
  position: string;
}

const HistoryModule: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [uniquePositions, setUniquePositions] = useState<string[]>([]);
  const [filter, setFilter] = useState({
    username: "",
    date: "",
    customerName: "",
    position: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Adjusts the time by subtracting 7 hours from `submissionTime`.
   */
  const adjustTimeBySubtracting7Hours = (timeString: string): string => {
    try {
      const parsedTime = parse(timeString, "HH:mm:ss", new Date());
      if (isNaN(parsedTime.getTime())) {
        throw new Error(`Invalid time format: ${timeString}`);
      }
      parsedTime.setHours(parsedTime.getHours() - 7);
      return format(parsedTime, "HH:mm:ss");
    } catch (error: any) {
      console.error("Error adjusting time:", error.message || error);
      return "Invalid time";
    }
  };

  useEffect(() => {
    const fetchReportsAndPositions = async () => {
      const storedUsername = localStorage.getItem("username");
      const storedPassword = localStorage.getItem("password");
      const storedRole = localStorage.getItem("role");

      if (!storedUsername || !storedPassword) {
        console.error("Missing credentials in local storage.");
        return;
      }

      try {
        // Fetch reports
        const endpoint =
          storedRole === "admin"
            ? "http://localhost:5000/api/reports"
            : `http://localhost:5000/api/reports?username=${storedUsername}`;

        const reportResponse = await axios.get<ReportData[]>(endpoint, {
          headers: {
            username: storedUsername,
            password: storedPassword,
          },
        });

        // Fetch users
        const userResponse = await axios.get<UserData[]>(
          "http://localhost:5000/api/users",
          {
            headers: {
              username: storedUsername,
              password: storedPassword,
            },
          }
        );

        const usersData = userResponse.data;

        // Enrich reports with position data
        const enrichedReports = reportResponse.data.map((report) => {
          const user = usersData.find((u) => u.username === report.username);
          return {
            ...report,
            position: user ? user.position : "Unknown",
          };
        });

        // Sort reports by createdAt in descending order
        const sortedReports = enrichedReports.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

              // Adjust submission time for each report
      const adjustedReports = sortedReports.map((report) => ({
        ...report,
        submissionTime: adjustTimeBySubtracting7Hours(report.submissionTime),
      }));

        setReports(adjustedReports);
        setFilteredReports(adjustedReports);

        // Get unique positions
        const positions = [...new Set(usersData.map((user) => user.position))].filter(Boolean);
        setUniquePositions(positions);

        // Get unique usernames
        const usernames = [...new Set(sortedReports.map((report) => report.username))];
        setUniqueUsernames(usernames);

        if (storedRole === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching reports or users:", error);
      }
    };

    fetchReportsAndPositions();
  }, []);

  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesUsername =
        filter.username && report.username
          ? report.username.toLowerCase().includes(filter.username.toLowerCase())
          : true;

      const matchesDate =
        filter.date && report.createdAt
          ? report.createdAt.startsWith(filter.date)
          : true;

      const matchesCustomerName = filter.customerName
        ? report.name.toLowerCase().includes(filter.customerName.toLowerCase())
        : true;

      const matchesPosition = filter.position
        ? report.position && report.position.toLowerCase() === filter.position.toLowerCase()
        : true;

      return matchesUsername && matchesDate && matchesCustomerName && matchesPosition;
    });

    setFilteredReports(filtered);
  }, [filter, reports]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const exportToCSV = () => {
    const headers = [
      "Username",
      "Location",
      "Name",
      "Submission Time",
      "End Time",
      "Created At",
      "Updated At",
      "Description",
    ];

    const rows = filteredReports.map((report) => [
      report.username,
      report.location,
      report.name,
      report.submissionTime,
      report.endTime,
      format(parseISO(report.createdAt), "yyyy-MM-dd HH:mm:ss"),
      format(parseISO(report.updatedAt), "yyyy-MM-dd HH:mm:ss"),
      report.description,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseLayout>
      <h1 className="text-center text-2xl font-bold mb-4 text-white">History</h1>
      <div
        className="flex flex-wrap gap-4 px-4 py-2"
        style={{
          marginTop: "40px",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Filters */}
        <div className="flex flex-col gap-2 w-full">
          <label className="block font-bold text-white mb-2">
            Filter by Username:
          </label>
          <select
            name="username"
            value={filter.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-100"
          >
            <option value="">All Users</option>
            {uniqueUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="block font-bold text-white mb-2">Filter by Date:</label>
          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="block font-bold text-white mb-2">
            Filter by Customer Name:
          </label>
          <input
            type="text"
            name="customerName"
            placeholder="Enter customer name"
            value={filter.customerName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        {/* Filter by Position (Admin Only) */}
        {isAdmin && (
          <div className="flex flex-col gap-2 w-full">
            <label className="block font-bold text-white mb-2">Filter by Position:</label>
            <select
              name="position"
              value={filter.position}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-gray-100"
            >
              <option value="">All Positions</option>
              {uniquePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Export Button (Admin Only) */}
      {isAdmin && (
        <div className="flex justify-center mt-4">
          <button
            onClick={exportToCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Export to CSV
          </button>
        </div>
      )}

      {/* Reports */}
      <div className="mt-6 flex flex-col gap-4 px-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col md:flex-row bg-gray-100 rounded-lg shadow-md p-4 gap-4"
              style={{
                marginBottom: "20px",
                alignItems: "flex-start",
              }}
            >
              {/* Image Section */}
              <div className="w-full md:w-1/3 relative group">
                {report.photo && (
                  <img
                    loading="eager"
                    src={`http://localhost:5000${report.photo}`}
                    alt="Report"
                    className="rounded-md object-cover cursor-pointer"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      transition: "transform 0.3s ease",
                    }}
                    onClick={() => setPreviewImage(`http://localhost:5000${report.photo}`)}
                  />
                )}
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => setPreviewImage(`http://localhost:5000${report.photo}`)}
                >
                  <span className="text-white text-lg font-bold">Click to Preview</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col w-full md:w-2/3">
                <p>
                  <strong>Username:</strong> {report.username}
                </p>
                <p>
                  <strong>Customer Name:</strong> {report.name}
                </p>
                <p>
                  <strong>Submission Time:</strong> {report.submissionTime}
                </p>
                <p>
                  <strong>End Time:</strong> {report.endTime}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Location:</strong> {report.location}
                </p>
                <p>
                  <strong>Position:</strong> {report.position}
                </p>
                <p>
                  <strong>Description:</strong> {report.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-300">No matching reports found.</p>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            loading="eager"
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-md"
          />
        </div>
      )}
    </BaseLayout>
  );
};

export default HistoryModule;
