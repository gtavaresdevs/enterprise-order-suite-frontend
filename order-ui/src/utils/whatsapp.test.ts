import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, normalizePhone } from "./whatsapp";

describe("normalizePhone", () => {
    it("keeps only digits", () => {
        expect(normalizePhone("+55 (11) 98765-4321")).toBe("5511987654321");
    });
});

describe("buildWhatsAppLink", () => {
    it("builds a wa.me link with the message URL-encoded", () => {
        expect(buildWhatsAppLink("+55 11 98765-4321", "Pedido #12 pronto & pago")).toBe(
            "https://wa.me/5511987654321?text=Pedido%20%2312%20pronto%20%26%20pago",
        );
    });
});
