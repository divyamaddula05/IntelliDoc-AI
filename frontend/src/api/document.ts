import { API } from "./auth";

// Upload PDF
export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get all documents
export const getDocuments = async () => {
  return API.get("/documents/");
};

// Delete document
export const deleteDocument = async (id: number) => {
  return API.delete(`/documents/${id}`);
};

// Get single document (optional)
export const getDocument = async (id: number) => {
  return API.get(`/documents/${id}`);
};