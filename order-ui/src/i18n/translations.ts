export type SupportedLocale = "fr-FR" | "es-ES";

export const LOCALE_BY_LANGUAGE: Record<string, SupportedLocale> = {
    "Français": "fr-FR",
    "Español": "es-ES",
};

export const TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
    "Dashboard": { "fr-FR": "Tableau de bord", "es-ES": "Panel" },
    "Orders": { "fr-FR": "Commandes", "es-ES": "Pedidos" },
    "Inventory": { "fr-FR": "Inventaire", "es-ES": "Inventario" },
    "Analytics": { "fr-FR": "Analytique", "es-ES": "Analítica" },
    "Security": { "fr-FR": "Sécurité", "es-ES": "Seguridad" },
    "Administration": { "fr-FR": "Administration", "es-ES": "Administración" },
    "Users": { "fr-FR": "Utilisateurs", "es-ES": "Usuarios" },
    "Administrators": { "fr-FR": "Administrateurs", "es-ES": "Administradores" },
    "Roles & Permissions": { "fr-FR": "Rôles et permissions", "es-ES": "Roles y permisos" },
    "View Profile": { "fr-FR": "Voir le profil", "es-ES": "Ver perfil" },
    "Notifications": { "fr-FR": "Notifications", "es-ES": "Notificaciones" },
    "Preferences": { "fr-FR": "Préférences", "es-ES": "Preferencias" },
    "Settings": { "fr-FR": "Paramètres", "es-ES": "Configuración" },
    "Sign out": { "fr-FR": "Se déconnecter", "es-ES": "Cerrar sesión" },
    "Navigation": { "fr-FR": "Navigation", "es-ES": "Navegación" },
    "Account": { "fr-FR": "Compte", "es-ES": "Cuenta" },
};
