import type {
    AdministrationPageId,
    AdministrationPageStatus,
} from "@/features/administration/types/administration.types";
import { ESTIMATED_RELEASE } from "@/features/administration/constants/administration.constants";

export const administrationService = {
    getPageStatus: async (pageId: AdministrationPageId): Promise<AdministrationPageStatus> =>
        new Promise((resolve) =>
            setTimeout(
                () =>
                    resolve({
                        pageId,
                        isAvailable: false,
                        estimatedRelease: ESTIMATED_RELEASE,
                    }),
                200,
            ),
        ),
};
