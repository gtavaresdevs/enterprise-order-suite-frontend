import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
    const iso = "2026-09-29T23:30:00Z";

    it("formats in the requested pattern", () => {
        expect(formatDate(iso, "DD/MM/YYYY", "UTC+00:00 — Greenwich Mean Time")).toBe("29/09/2026");
        expect(formatDate(iso, "YYYY-MM-DD", "UTC+00:00 — Greenwich Mean Time")).toBe("2026-09-29");
        expect(formatDate(iso, "D MMM YYYY", "UTC+00:00 — Greenwich Mean Time")).toBe("29 Sep 2026");
    });

    it("applies the timezone offset before taking the date", () => {
        expect(formatDate(iso, "DD/MM/YYYY", "UTC+01:00 — Central European Time")).toBe("30/09/2026");
    });

    it("falls back to MM/DD/YYYY for an unknown pattern", () => {
        expect(formatDate(iso, "unknown", "UTC+00:00 — Greenwich Mean Time")).toBe("09/29/2026");
    });
});
