import type { UserProfileForm } from "@/types/profile";

export const profileService = {
    // Simulates fetching initial profile data
    getProfile: async (): Promise<Partial<UserProfileForm>> => {
        return Promise.resolve({});
    },

    // Simulates a mutation to save the profile
    saveProfile: async (data: UserProfileForm): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 500));
    },
};