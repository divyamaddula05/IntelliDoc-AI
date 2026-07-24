import { useEffect, useState } from "react";
import { FiFileText, FiTrash2 } from "react-icons/fi";
import {
  getDocuments,
  deleteDocument,
} from "../api/document";

interface Document {
  id: number;
  filename: string;
}

interface Props {
  selectedDocument: Document | null;
  onSelect: (doc: Document) => void;
  refresh: boolean;
}

export default function DocumentList({
  selectedDocument,
  onSelect,
  refresh,
}: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const res = await getDocuments();

      setDocuments(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refresh]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Delete this document?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDocument(id);

      loadDocuments();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">

      <h2 className="text-xl font-bold mb-4">
        Documents
      </h2>

      {loading ? (
        <p className="text-gray-500">
          Loading...
        </p>
      ) : documents.length === 0 ? (
        <p className="text-gray-500">
          No documents uploaded.
        </p>
      ) : (
        <div className="space-y-3">

          {documents.map((doc) => (

            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              className={`flex items-center justify-between rounded-xl p-3 cursor-pointer transition

              ${
                selectedDocument?.id === doc.id
                  ? "bg-blue-100 border border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >

              <div className="flex items-center gap-3">

                <FiFileText className="text-blue-600 text-xl" />

                <span className="font-medium">
                  {doc.filename}
                </span>

              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 />
              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}