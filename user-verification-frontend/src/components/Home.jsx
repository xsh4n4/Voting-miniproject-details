import { useEffect, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  FileText,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { BaseUrl } from "../utils/baseUrl";

const statusColors = {
  1: "bg-amber-100 text-amber-500 border-amber-200",
  2: "bg-green-100 text-green-500 border-green-200",
  3: "bg-red-100 text-red-500 border-red-200",
};

const statusIcons = {
  1: <Clock className="w-4 h-4 mr-1" />,
  2: <CheckCircle className="w-4 h-4 mr-1" />,
  3: <XCircle className="w-4 h-4 mr-1" />,
};

const statusLabels = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};

const Home = () => {
  const [inProgressUsers, setInProgressUsers] = useState([]);
  const [completedUsers, setCompletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInProgressUsers = async () => {
    try {
      const res = await fetch(`${BaseUrl}/api/fetchinprogress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });
      const data = await res.json();
      if (data.success) {
        setInProgressUsers(data.inProgressUsers);
        setLoading(false);
      } else {
        console.error("Failed to fetch in-progress users.");
      }
    } catch (error) {
      console.error("Error fetching in-progress users:", error);
    }
  };

  const fetchCompletedUsers = async () => {
    try {
      const res = await fetch(`${BaseUrl}/api/fetchcompleted`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });
      const data = await res.json();
      if (data.success) {
        setCompletedUsers(data.completedUsers);
        setLoading(false);
      } else {
        console.error("Failed to fetch in-progress users.");
      }
    } catch (error) {
      console.error("Error fetching in-progress users:", error);
    }
  };

  const handleDecision = async (userId, newStatus) => {
    try {
      const res = await fetch(`${BaseUrl}/api/updateprogress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ userId, progress: newStatus }),
      });
  
      const data = await res.json();
      if (data.success) {
        // Refresh both lists
        fetchInProgressUsers();
        fetchCompletedUsers();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Something went wrong");
    }
  };  

  useEffect(() => {
    fetchInProgressUsers();
    fetchCompletedUsers();
  }, []);

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
            Admin Dashboard
          </h1>
        </div>

        {/* Dashboard Summary */}

        {/* Requested Certificates Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="bg-amber-500 from-amber-500 to-amber-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Pending Requests
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              renderSkeleton()
            ) : inProgressUsers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full overflow-scroll">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inProgressUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <img src={BaseUrl + user.imageurl} alt="User" className="h-50" />
                          </td>
                          <td className="flex justify-around px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDecision(user._id, 3)}
                              className="inline-flex cursor-pointer items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleDecision(user._id, 2)}
                              className="inline-flex cursor-pointer items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-gray-500">Pending requests will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Approved Certificates Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="bg-blue-500 from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Resolved Requests
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              renderSkeleton()
            ) : completedUsers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full overflow-scroll">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {completedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[user.progress]}`}>
                              {statusIcons[user.progress]}
                              {statusLabels[user.progress]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No resolved requests</h3>
                <p className="mt-1 text-gray-500">Requests resolved will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
