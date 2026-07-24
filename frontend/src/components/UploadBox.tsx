import { useState } from "react";
import { FiUploadCloud, FiFileText } from "react-icons/fi";
import { uploadDocument } from "../api/document";

interface Props {
  onUploadSuccess: () => void;
}

export default function UploadBox({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      await uploadDocument(file);

      setMessage("✅ Document uploaded successfully!");
      setFile(null);
      onUploadSuccess();

    } catch (err: any) {
      setMessage(
        err.response?.data?.detail || "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex items-center gap-2 mb-4">
        <FiUploadCloud className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-bold text-gray-800">
          Upload Document
        </h2>
      </div>

      <label
        htmlFor="pdf-upload"
        className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
      >
        <FiFileText className="text-5xl text-blue-500 mb-3" />

        <p className="text-gray-700 font-medium">
          {file ? file.name : "Choose a PDF"}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Click here to browse your files
        </p>

        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>

      {message && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}