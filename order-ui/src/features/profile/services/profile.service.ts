import type { UserProfileForm, ChangePasswordPayload } from "@/features/profile/types/profile.types";

export const profileService = {
    // GET /api/v1/users/me
    getProfile: async (): Promise<Partial<UserProfileForm>> => {
        return Promise.resolve({});
    },

    // PATCH /api/v1/users/me
    saveProfile: async (_data: Partial<UserProfileForm>): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 800));
    },

    // POST /api/v1/users/me/avatar
    updateAvatar: async (_file: File): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 1000));
    },

    // PUT /api/v1/users/me/password
    changePassword: async (_data: ChangePasswordPayload): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 800));
    },
};