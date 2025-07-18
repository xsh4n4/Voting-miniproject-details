import { useState } from 'react';
import {
  CheckCircle,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BaseUrl } from '../utils/baseUrl';

const Certificate = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress || !imageFile) {
      alert('Please provide all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('wallet', walletAddress);
    formData.append('image', imageFile);
    formData.append('subject', subject);

    setIsSubmitting(true);
    setUploading(true);

    try {
      const res = await fetch(`${BaseUrl}/api/uploadrequest`, {
        method: 'POST',
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Upload successful!');
        setWalletAddress('');
        setImageFile(null);
        setSubject('');
        setFileName('');
      } else {
        setMessage('Upload failed: ' + data.message);
      }

    } catch (error) {
      console.error('Upload Error:', error);
      setMessage('Something went wrong during upload.');
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 bg-gray-900 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Voter Verification Portal</h2>
          <p className="text-gray-600">Request token to vote</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Input */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" /> Upload your voter ID
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="w-full sm:w-1/3 font-medium text-gray-700 text-sm">File:</label>
              <div className="w-full sm:w-2/3">
                <input
                  type="file"
                  className="hidden"
                  id="upload-single"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />

                {fileName ? (
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-md p-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate flex-1">{fileName}</span>
                    <label htmlFor="upload-single" className="text-xs text-blue-600 cursor-pointer ml-2">
                      Change
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="upload-single"
                    className={`flex items-center justify-center w-full border-2 border-dashed rounded-md p-3 cursor-pointer ${
                      uploading ? 'bg-gray-100 border-blue-300' : 'border-blue-300 hover:border-blue-500 bg-blue-50'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 text-gray-500 mr-2 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">Choose file</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Optional Details */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Any additional information or requirements..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Notification */}
          {message && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all duration-200 flex items-center justify-center ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Verification Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Certificate;
