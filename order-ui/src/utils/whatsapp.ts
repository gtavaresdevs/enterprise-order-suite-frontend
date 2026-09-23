export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
}

export function buildWhatsAppLink(phone: string, message: string): string {
    const digits = normalizePhone(phone);
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
