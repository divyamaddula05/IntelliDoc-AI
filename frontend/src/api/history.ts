import { API } from "./auth";

export const getChatHistory = (documentId: number) => {
  return API.get(`/chat/history/${documentId}`);
};