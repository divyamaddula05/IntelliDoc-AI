import { API } from "./auth";

export const askQuestion = async (
  documentId: number,
  question: string
) => {
  return API.post("/chat/", {
    document_id: documentId,
    question: question,
  });
};