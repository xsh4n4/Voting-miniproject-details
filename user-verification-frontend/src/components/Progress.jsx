import { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { BaseUrl } from '../utils/baseUrl';

const UserProgress = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BaseUrl}/api/getuser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token'), // Pass the auth token for authorization
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);  // Save the user data
        } else {
          setError(data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        <p>User not found</p>
      </div>
    );
  }

  // Render user progress based on their status
  const progressStatuses = ['Not started', 'In progress', 'Completed', 'Failed'];

  const getStatusStyles = () => {
    switch (user.progress) {
      case 0:
        return {
          color: 'text-gray-500',
          icon: <FileText className="w-6 h-6 text-gray-500" />,
          text: 'Not started',
          bgColor: 'bg-gray-200'
        };
      case 1:
        return {
          color: 'text-orange-500',
          icon: <Clock className="w-6 h-6 text-orange-500" />,
          text: 'In progress',
          bgColor: 'bg-orange-100'
        };
      case 2:
        return {
          color: 'text-green-500',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: 'Completed',
          bgColor: 'bg-green-100'
        };
      case 3:
        return {
          color: 'text-red-500',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          text: 'Failed',
          bgColor: 'bg-red-100'
        };
      default:
        return {};
    }
  };

  const { color, icon, text, bgColor } = getStatusStyles();

  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-gray-900">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105">
        {/* User Progress Section */}
        <div className="p-6 space-y-6">
          {/* User Progress */}
          <div className="p-4 rounded-lg flex items-center space-x-4">
            <div className={`p-3 rounded-full ${bgColor}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${color}`}>
                Verification Progress
              </h3>
              <p className={`text-sm ${color}`}>
                Current progress: <strong>{text}</strong>
              </p>
            </div>
          </div>

          {/* Optional: Additional information or next steps can be added here */}
          <div className="text-sm text-gray-500">
            <p>Your current progress is represented above. If you need assistance, please contact support.</p>
          </div>
          {user.progress == 2 && <button
            onClick={() => window.open("https://voting-mini-project.vercel.app")}
            className="inline-flex cursor-pointer items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Vote
          </button>}
        </div>
      </div>
    </div>
  );
};

export default UserProgress;
