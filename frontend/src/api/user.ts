import { API } from "./auth";

export const getCurrentUser = () => {
    return API.get("/users/me");
};