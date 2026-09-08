import api from "@/api/client";
import type {
    ProfileResponse,
    UpdateProfileRequest,
} from "@/types/profile";

export const profileService = {
    // GET /api/me/profile
    getProfile: async (): Promise<ProfileResponse> => {
        const { data } = await api.get<ProfileResponse>("/me/profile");
        return data;
    },

    // PATCH /api/me/profile
    updateProfile: async (request: UpdateProfileRequest): Promise<ProfileResponse> => {
        const { data } = await api.patch<ProfileResponse>("/me/profile", request);
        return data;
    },

    // Alias for updateProfile if called as saveProfile
    saveProfile: async (request: UpdateProfileRequest): Promise<ProfileResponse> => {
        return profileService.updateProfile(request);
    },

    // POST /api/users/me/avatar
    updateAvatar: async (_file: File): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 500));
    },
};