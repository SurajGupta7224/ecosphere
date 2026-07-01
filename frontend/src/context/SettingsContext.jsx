import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { IMAGE_BASE_URL } from '../api';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

// ─── Translation Dictionary for Dynamic i18n ─────────────────────────────────
const TRANSLATIONS = {
  English: {
    dashboard: "Dashboard",
    profile: "Profile",
    catalog: "Catalog",
    categories: "Categories",
    sub_categories: "Sub-Categories",
    general_master: "General Master",
    users: "Users",
    roles: "Roles",
    permissions: "Permissions",
    locations: "Locations",
    bwg_mapping: "BWG Mapping",
    corporation: "Corporation",
    zone: "Zone",
    ward: "Ward",
    collection_event: "Collection Event",
    waste_collection_requests: "Waste Collection Requests",
    time_slot_management: "Time Slot Management",
    settings: "Settings",
    admin_panel: "Admin Panel",
    sign_out: "Sign Out",

    dashboard_overview: "Dashboard Overview",
    system_snapshot: "System snapshot and real-time metrics.",
    total_users: "Total Users",
    active_roles: "Active Roles",
    total_cities: "Total Cities",
    total_pincodes: "Total Pincodes",
    manage_users: "Manage Users",
    manage_roles: "Manage Roles",
    view_locations: "View Locations",
    welcome_back: "Welcome back",
    system_health: "System Health",
    operational: "Operational",
    live: "Live",
    optimal: "Optimal",
    last_aggregation: "Last aggregation",

    save_settings: "Save Settings",
    reset: "Reset",
    saving: "Saving...",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    search: "Search",
    status: "Status",
    add: "Add",
    active: "Active",
    inactive: "Inactive",
    loading: "Loading...",

    // Settings Sidebar
    general_settings: "General Settings",
    branding_settings: "Branding Settings",
    theme_settings: "Theme Settings",
    company_settings: "Company Settings",
    email_settings: "Email Settings",
    security_settings: "Security Settings",
    system_settings: "System Settings",
    audit_logs: "Audit Logs",
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    catalog: "कैटलॉग",
    categories: "श्रेणियाँ",
    sub_categories: "उप-श्रेणियाँ",
    general_master: "सामान्य मास्टर",
    users: "उपयोगकर्ता",
    roles: "भूमिकाएँ",
    permissions: "अनुमतियाँ",
    locations: "स्थान",
    bwg_mapping: "BWG मैपिंग",
    corporation: "निगम",
    zone: "जोन",
    ward: "वार्ड",
    collection_event: "कलेक्शन इवेंट",
    waste_collection_requests: "कचरा संग्रहण अनुरोध",
    settings: "सेटिंग्स",
    admin_panel: "एडमिन पैनल",
    sign_out: "साइन आउट",

    dashboard_overview: "डैशबोर्ड अवलोकन",
    system_snapshot: "सिस्टम स्नैपशॉट और वास्तविक समय मेट्रिक्स।",
    total_users: "कुल उपयोगकर्ता",
    active_roles: "सक्रिय भूमिकाएँ",
    total_cities: "कुल शहर",
    total_pincodes: "कुल पिनकोड",
    manage_users: "उपयोगकर्ता प्रबंधित करें",
    manage_roles: "भूमिकाएं प्रबंधित करें",
    view_locations: "स्थान देखें",
    welcome_back: "स्वागत है",
    system_health: "सिस्टम स्वास्थ्य",
    operational: "परिचालन",
    live: "लाइव",
    optimal: "इष्टतम",
    last_aggregation: "अंतिम एकत्रीकरण",

    save_settings: "सेटिंग्स सहेजें",
    reset: "रीसेट करें",
    saving: "सहेज रहा है...",
    cancel: "रद्द करें",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "हटाएं",
    actions: "क्रियाएँ",
    search: "खोजें",
    status: "स्थिति",
    add: "जोड़ें",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    loading: "लोड हो रहा है...",

    general_settings: "सामान्य सेटिंग्स",
    branding_settings: "ब्रांडिंग सेटिंग्स",
    theme_settings: "थीम सेटिंग्स",
    company_settings: "कंपनी सेटिंग्स",
    email_settings: "ईमेल सेटिंग्स",
    security_settings: "सुरक्षा सेटिंग्स",
    system_settings: "सिस्टम सेटिंग्स",
    audit_logs: "ऑडिट लॉग्स",
  },
  Spanish: {
    dashboard: "Tablero",
    profile: "Perfil",
    catalog: "Catálogo",
    categories: "Categorías",
    sub_categories: "Subcategorías",
    general_master: "Maestro General",
    users: "Usuarios",
    roles: "Roles",
    permissions: "Permisos",
    locations: "Ubicaciones",
    bwg_mapping: "Mapeo BWG",
    corporation: "Corporación",
    zone: "Zona",
    ward: "Distrito",
    collection_event: "Evento de recolección",
    waste_collection_requests: "Solicitudes de recogida de residuos",
    settings: "Configuración",
    admin_panel: "Panel de Administración",
    sign_out: "Cerrar sesión",

    dashboard_overview: "Resumen del Tablero",
    system_snapshot: "Instantánea del sistema y métricas en tiempo real.",
    total_users: "Usuarios Totales",
    active_roles: "Roles Activos",
    total_cities: "Ciudades Totales",
    total_pincodes: "Pincodes Totales",
    manage_users: "Administrar Usuarios",
    manage_roles: "Administrar Roles",
    view_locations: "Ver Ubicaciones",
    welcome_back: "Bienvenido de nuevo",
    system_health: "Salud del Sistema",
    operational: "Operativo",
    live: "En vivo",
    optimal: "Óptimo",
    last_aggregation: "Última agregación",

    save_settings: "Guardar configuración",
    reset: "Restablecer",
    saving: "Guardando...",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    actions: "Acciones",
    search: "Buscar",
    status: "Estado",
    add: "Añadir",
    active: "Activo",
    inactive: "Inactivo",
    loading: "Cargando...",

    general_settings: "Configuración General",
    branding_settings: "Configuración de Marca",
    theme_settings: "Configuración de Tema",
    company_settings: "Configuración de Empresa",
    email_settings: "Configuración de Correo",
    security_settings: "Configuración de Seguridad",
    system_settings: "Configuración de Sistema",
    audit_logs: "Registros de Auditoría",
  },
  French: {
    dashboard: "Tableau de bord",
    profile: "Profil",
    catalog: "Catalogue",
    categories: "Catégories",
    sub_categories: "Sous-catégories",
    general_master: "Master Général",
    users: "Utilisateurs",
    roles: "Rôles",
    permissions: "Autorisations",
    locations: "Emplacements",
    bwg_mapping: "Cartographie BWG",
    corporation: "Corporation",
    zone: "Zone",
    ward: "Quartier",
    collection_event: "Événement de collecte",
    settings: "Paramètres",
    admin_panel: "Panneau d'administration",
    sign_out: "Se déconnecter",

    dashboard_overview: "Aperçu du tableau de bord",
    system_snapshot: "Instantané du système et mesures en temps réel.",
    total_users: "Nombre total d'utilisateurs",
    active_roles: "Rôles actifs",
    total_cities: "Nombre total de villes",
    total_pincodes: "Nombre total de codes postaux",
    manage_users: "Gérer les utilisateurs",
    manage_roles: "Gérer les rôles",
    view_locations: "Afficher les emplacements",
    welcome_back: "Bon retour",
    system_health: "Santé du système",
    operational: "Opérationnel",
    live: "En direct",
    optimal: "Optimal",
    last_aggregation: "Dernière agrégation",

    save_settings: "Enregistrer les paramètres",
    reset: "Réinitialiser",
    saving: "Enregistrement...",
    cancel: "Annuler",
    save: "Enregistrer",
    edit: "Modifier",
    delete: "Supprimer",
    actions: "Actions",
    search: "Rechercher",
    status: "Statut",
    add: "Ajouter",
    active: "Actif",
    inactive: "Inactif",
    loading: "Chargement...",

    general_settings: "Paramètres Généraux",
    branding_settings: "Paramètres de Marque",
    theme_settings: "Paramètres de Thème",
    company_settings: "Paramètres d'Entreprise",
    email_settings: "Paramètres de Messagerie",
    security_settings: "Paramètres de Sécurité",
    system_settings: "Paramètres Système",
    audit_logs: "Journaux d'Audit",
  },
  German: {
    dashboard: "Dashboard",
    profile: "Profil",
    catalog: "Katalog",
    categories: "Kategorien",
    sub_categories: "Unterkategorien",
    general_master: "General Master",
    users: "Benutzer",
    roles: "Rollen",
    permissions: "Berechtigungen",
    locations: "Standorte",
    bwg_mapping: "BWG-Kartierung",
    corporation: "Körperschaft",
    zone: "Zone",
    ward: "Bezirk",
    collection_event: "Sammel-Event",
    settings: "Einstellungen",
    admin_panel: "Admin-Panel",
    sign_out: "Abmelden",

    dashboard_overview: "Dashboard-Übersicht",
    system_snapshot: "System-Snapshot und Echtzeit-Metriken.",
    total_users: "Benutzer insgesamt",
    active_roles: "Aktive Rollen",
    total_cities: "Städte insgesamt",
    total_pincodes: "Postleitzahlen insgesamt",
    manage_users: "Benutzer verwalten",
    manage_roles: "Rollen verwalten",
    view_locations: "Standorte anzeigen",
    welcome_back: "Willkommen zurück",
    system_health: "Systemstatus",
    operational: "Betriebsbereit",
    live: "Live",
    optimal: "Optimal",
    last_aggregation: "Letzte Aggregation",

    save_settings: "Einstellungen speichern",
    reset: "Zurücksetzen",
    saving: "Speichern...",
    cancel: "Abbrechen",
    save: "Speichern",
    edit: "Bearbeiten",
    delete: "Löschen",
    actions: "Aktionen",
    search: "Suchen",
    status: "Status",
    add: "Hinzufügen",
    active: "Aktiv",
    inactive: "Inaktiv",
    loading: "Laden...",

    general_settings: "Allgemeine Einstellungen",
    branding_settings: "Branding-Einstellungen",
    theme_settings: "Theme-Einstellungen",
    company_settings: "Firmen-Einstellungen",
    email_settings: "E-Mail-Einstellungen",
    security_settings: "Sicherheits-Einstellungen",
    system_settings: "System-Einstellungen",
    audit_logs: "Audit-Protokolle",
  },
  Arabic: {
    dashboard: "لوحة القيادة",
    profile: "الملف الشخصي",
    catalog: "الكتالوج",
    categories: "الفئات",
    sub_categories: "الفئات الفرعية",
    general_master: "الرئيسي العام",
    users: "المستخدمين",
    roles: "الأدوار",
    permissions: "الأذونات",
    locations: "المواقع",
    bwg_mapping: "تخطيط BWG",
    corporation: "مؤسسة",
    zone: "منطقة",
    ward: "جناح",
    collection_event: "حدث جمع",
    settings: "الإعدادات",
    admin_panel: "لوحة التحكم",
    sign_out: "تسجيل الخروج",

    dashboard_overview: "نظرة عامة على لوحة القيادة",
    system_snapshot: "لقطة النظام والمقاييس في الوقت الفعلي.",
    total_users: "إجمالي المستخدمين",
    active_roles: "الأدوار النشطة",
    total_cities: "إجمالي المدن",
    total_pincodes: "إجمالي الرموز البريدية",
    manage_users: "إدارة المستخدمين",
    manage_roles: "إدارة الأدوار",
    view_locations: "عرض المواقع",
    welcome_back: "مرحبًا بعودتك",
    system_health: "صحة النظام",
    operational: "شغال",
    live: "مباشر",
    optimal: "أمثل",
    last_aggregation: "آخر تجميع",

    save_settings: "حفظ الإعدادات",
    reset: "إعادة تعيين",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",
    search: "بحث",
    status: "الحالة",
    add: "إضافة",
    active: "نشط",
    inactive: "غير نشط",
    loading: "جاري التحميل...",

    general_settings: "الإعدادات العامة",
    branding_settings: "إعدادات الهوية التجارية",
    theme_settings: "إعدادات المظهر",
    company_settings: "إعدادات الشركة",
    email_settings: "إعدادات البريد الإلكتروني",
    security_settings: "الإعدادات الأمنية",
    system_settings: "إعدادات النظام",
    audit_logs: "سجلات التدقيق",
  },
  Japanese: {
    dashboard: "ダッシュボード",
    profile: "プロフィール",
    catalog: "カタログ",
    categories: "カテゴリー",
    sub_categories: "サブカテゴリー",
    general_master: "ジェネラルマスター",
    users: "ユーザー",
    roles: "役割",
    permissions: "権限",
    locations: "ロケーション",
    bwg_mapping: "BWGマッピング",
    corporation: "コーポレーション",
    zone: "ゾーン",
    ward: "ワード",
    collection_event: "収集イベント",
    settings: "設定",
    admin_panel: "管理パネル",
    sign_out: "サインアウト",

    dashboard_overview: "ダッシュボード概要",
    system_snapshot: "システムスナップショットとリアルタイムメトリクス。",
    total_users: "合計ユーザー",
    active_roles: "アクティブな役割",
    total_cities: "合計都市",
    total_pincodes: "合計郵便番号",
    manage_users: "ユーザー管理",
    manage_roles: "役割管理",
    view_locations: "場所を表示",
    welcome_back: "おかえりなさい",
    system_health: "システム状態",
    operational: "稼働中",
    live: "ライブ",
    optimal: "最適",
    last_aggregation: "最終集計",

    save_settings: "設定を保存",
    reset: "リセット",
    saving: "保存中...",
    cancel: "キャンセル",
    save: "保存",
    edit: "編集",
    delete: "削除",
    actions: "アクション",
    search: "検索",
    status: "ステータス",
    add: "追加",
    active: "アクティブ",
    inactive: "非アクティブ",
    loading: "読み込み中...",

    general_settings: "一般設定",
    branding_settings: "ブランディング設定",
    theme_settings: "テーマ設定",
    company_settings: "企業設定",
    email_settings: "メール設定",
    security_settings: "セキュリティ設定",
    system_settings: "システム設定",
    audit_logs: "監査ログ",
  },
  Tamil: {
    dashboard: "தகவல் பலகை",
    profile: "சுயவிவரம்",
    catalog: "பட்டியல்",
    categories: "வகைகள்",
    sub_categories: "துணை வகைகள்",
    general_master: "பொது மாஸ்டர்",
    users: "பயனர்கள்",
    roles: "பாத்திரங்கள்",
    permissions: "அனுமதிகள்",
    locations: "இருப்பிடங்கள்",
    bwg_mapping: "BWG மேப்பிங்",
    corporation: "மாநகராட்சி",
    zone: "மண்டலம்",
    ward: "வார்டு",
    collection_event: "சேகரிப்பு நிகழ்வு",
    settings: "அமைப்புகள்",
    admin_panel: "நிர்வாக குழு",
    sign_out: "வெளியேறு",

    dashboard_overview: "டாஷ்போர்டு மேலோட்டம்",
    system_snapshot: "கணினி ஸ்னாப்ஷாட் மற்றும் நிகழ்நேர அளவீடுகள்.",
    total_users: "மொத்த பயனர்கள்",
    active_roles: "செயலில் உள்ள பாத்திரங்கள்",
    total_cities: "மொத்த நகரங்கள்",
    total_pincodes: "மொத்த பின்கோடுகள்",
    manage_users: "பயனர்களை நிர்வகி",
    manage_roles: "பாத்திரங்களை நிர்வகி",
    view_locations: "இருப்பிடங்களைக் காண்க",
    welcome_back: "மீண்டும் வருக",
    system_health: "கணினி ஆரோக்கியம்",
    operational: "செயல்பாட்டு",
    live: "நேரடி",
    optimal: "உகந்த",
    last_aggregation: "கடைசி ஒருங்கிணைப்பு",

    save_settings: "அமைப்புகளைச் சேமி",
    reset: "மீட்டமை",
    saving: "சேமிக்கிறது...",
    cancel: "ரத்துசெய்",
    save: "சேமி",
    edit: "திருத்து",
    delete: "அழி",
    actions: "நடவடிக்கைகள்",
    search: "தேடு",
    status: "நிலை",
    add: "சேர்",
    active: "செயலில்",
    inactive: "செயலற்ற",
    loading: "ஏற்றப்படுகிறது...",

    general_settings: "பொதுவான அமைப்புகள்",
    branding_settings: "பிராண்டிங் அமைப்புகள்",
    theme_settings: "தீம் அமைப்புகள்",
    company_settings: "நிறுவன அமைப்புகள்",
    email_settings: "மின்னஞ்சல் அமைப்புகள்",
    security_settings: "பாதுகாப்பு அமைப்புகள்",
    system_settings: "கணினி அமைப்புகள்",
    audit_logs: "தணிக்கை பதிவுகள்",
  },
  Kannada: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    profile: "ಪ್ರೊಫೈಲ್",
    catalog: "ಕ್ಯಾಟಲಾಗ್",
    categories: "ವರ್ಗಗಳು",
    sub_categories: "ಉಪ ವರ್ಗಗಳು",
    general_master: "ಜನರಲ್ ಮಾಸ್ಟರ್",
    users: "ಬಳಕೆದಾರರು",
    roles: "ಪಾತ್ರಗಳು",
    permissions: "ಅನುಮತಿಗಳು",
    locations: "ಸ್ಥಳಗಳು",
    bwg_mapping: "BWG ಮ್ಯಾಪಿಂಗ್",
    corporation: "ನಿಗಮ",
    zone: "ವಲಯ",
    ward: "ವಾರ್ಡ್",
    collection_event: "ಸಂಗ್ರಹಣೆ ಈವೆಂಟ್",
    settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    admin_panel: "ನಿರ್ವಾಹಕ ಫಲಕ",
    sign_out: "ಸೈನ್ ಔಟ್",

    dashboard_overview: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ",
    system_snapshot: "ಸಿಸ್ಟಮ್ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಮತ್ತು ನೈಜ-ಸಮಯದ ಮೆಟ್ರಿಕ್ಸ್.",
    total_users: "ಒಟ್ಟು ಬಳಕೆದಾರರು",
    active_roles: "ಸಕ್ರಿಯ ಪಾತ್ರಗಳು",
    total_cities: "ಒಟ್ಟು ನಗರಗಳು",
    total_pincodes: "ಒಟ್ಟು ಪಿನ್‌ಕೋಡ್‌ಗಳು",
    manage_users: "ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಿ",
    manage_roles: "ಪಾತ್ರಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    view_locations: "ಸ್ಥಳಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    welcome_back: "ಮರಳಿ ಸ್ವಾಗತ",
    system_health: "ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ",
    operational: "ಕಾರ್ಯನಿರತ",
    live: "ಲೈವ್",
    optimal: "ಸೂಕ್ತ",
    last_aggregation: "ಕೊನೆಯ ಒಟ್ಟುಗೂಡಿಸುವಿಕೆ",

    save_settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಿ",
    reset: "ಮರುಹೊಂದಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    cancel: "ರದ್ದುಮಾಡು",
    save: "ಉಳಿಸಿ",
    edit: "ಸಂಪಾದಿಸಿ",
    delete: "ಅಳಿಸಿ",
    actions: "ಕ್ರಿಯೆಗಳು",
    search: "ಹುಡುಕು",
    status: "ಸ್ಥಿತಿ",
    add: "ಸೇರಿಸು",
    active: "ಸಕ್ರಿಯ",
    inactive: "ನಿಷ್ಕ್ರಿಯ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",

    general_settings: "ಸಾಮಾನ್ಯ ಸೆಟ್ಟಿಂಗ್ಸ್",
    branding_settings: "ಬ್ರ್ಯಾಂಡಿಂಗ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    theme_settings: "ಥೀಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    company_settings: "ಕಂಪನಿ ಸೆಟ್ಟಿಂಗ್ಸ್",
    email_settings: "ಇಮೇಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    security_settings: "ಭದ್ರತಾ ಸೆಟ್ಟಿಂಗ್ಸ್",
    system_settings: "ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    audit_logs: "ಆಡಿಟ್ ಲಾಗ್‌ಗಳು",
  }
};

const DEFAULTS = {
  appName: 'Ecosphere',
  appShortName: 'ECO',
  companyName: 'Ecosphere',
  companyTagline: 'Sustainable Future',
  companyLogo: null,
  favicon: null,
  loginLogo: null,
  loginBg: null,
  footerCopyright: `© ${new Date().getFullYear()} Ecosphere. All rights reserved.`,
  supportEmail: '',
  supportPhone: '',
  maintenanceMode: false,
  defaultLanguage: 'English',
  theme: {
    theme_type: 'light',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    sidebar_color: '#1e133c',
    sidebar_text_color: '#cbd5e1',
    sidebar_active_bg_color: '#ffffff1a',
    sidebar_active_text_color: '#ffffff',
    navbar_color: '#ffffff',
    card_bg_color: '#ffffff',
    button_color: '#6366f1',
    text_color: '#1e293b',
  }
};

// ── Determine if dark mode should be active ───────────────────────────────────
const shouldBeDark = (themeType) => {
  if (themeType === 'dark') return true;
  if (themeType === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
  return false; // 'light'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // ── Apply theme colours as CSS variables + toggle dark class ─────────────────
  const applyTheme = useCallback((theme) => {
    if (!theme) return;
    const root = document.documentElement;

    // 1. Toggle dark class on <html> for CSS dark mode overrides
    const dark = shouldBeDark(theme.theme_type);
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Set CSS variables for dynamic colors
    root.style.setProperty('--color-primary',   theme.primary_color   || '#6366f1');
    root.style.setProperty('--color-secondary', theme.secondary_color || '#8b5cf6');
    root.style.setProperty('--color-sidebar',   theme.sidebar_color   || '#1e133c');
    root.style.setProperty('--color-sidebar-text', theme.sidebar_text_color || '#cbd5e1');
    root.style.setProperty('--color-sidebar-active-bg', theme.sidebar_active_bg_color || '#ffffff1a');
    root.style.setProperty('--color-sidebar-active-text', theme.sidebar_active_text_color || '#ffffff');
    root.style.setProperty('--color-navbar',    theme.navbar_color    || (dark ? '#1e293b' : '#ffffff'));
    root.style.setProperty('--color-card-bg',   theme.card_bg_color   || (dark ? '#1e293b' : '#ffffff'));
    root.style.setProperty('--color-button',    theme.button_color    || '#6366f1');
    root.style.setProperty('--color-text',      theme.text_color      || (dark ? '#f1f5f9' : '#1e293b'));

    // 3. Update content backgrounds
    if (dark) {
      root.style.setProperty('--app-bg',      '#0f172a');
      root.style.setProperty('--content-bg',  '#111827');
      root.style.setProperty('--card-surface','#1e293b');
    } else {
      root.style.setProperty('--app-bg',      '#f3f4f6');
      root.style.setProperty('--content-bg',  '#f8f9fa');
      root.style.setProperty('--card-surface', theme.card_bg_color || '#ffffff');
    }
  }, []);

  // ── Apply branding (title + favicon) ─────────────────────────────────────────
  const applyBranding = useCallback((s) => {
    if (!s) return;
    if (s.appName) document.title = `${s.appName} | Admin Panel`;
    if (s.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = `${IMAGE_BASE_URL}/${s.favicon}`;
      
      // Update type attribute based on extension to force browser update
      const ext = s.favicon.split('.').pop().toLowerCase();
      if (ext === 'svg') {
        link.type = 'image/svg+xml';
      } else if (ext === 'png') {
        link.type = 'image/png';
      } else if (ext === 'ico') {
        link.type = 'image/x-icon';
      } else {
        link.removeAttribute('type');
      }
    }
  }, []);

  // ── Fetch from API and apply everything ───────────────────────────────────────
  const fetchPublicSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings/public');
      if (res.data.success) {
        const s = res.data.settings;
        setSettings(prev => ({ ...DEFAULTS, ...prev, ...s }));
        applyTheme(s.theme);
        applyBranding(s);
      }
    } catch {
      // fail silently — defaults stay in place
    } finally {
      setLoading(false);
    }
  }, [applyTheme, applyBranding]);

  // ── Called by Settings page right after a successful PUT ──────────────────────
  const refreshSettings = useCallback((patch = null) => {
    if (patch) {
      setSettings(prev => {
        const next = { ...prev, ...patch };
        // If theme patch, apply it immediately
        if (patch.theme) {
          const mergedTheme = { ...prev.theme, ...patch.theme };
          applyTheme(mergedTheme);
          next.theme = mergedTheme;
        }
        if (patch.appName || patch.favicon) applyBranding(next);
        return next;
      });
    }
    // Always also do a full re-fetch to stay in sync with DB
    fetchPublicSettings();
  }, [fetchPublicSettings, applyTheme, applyBranding]);

  // ── Translation Helper Function ──────────────────────────────────────────────
  const t = useCallback((key) => {
    let lang = settings?.defaultLanguage || 'English';
    if (lang === 'en') lang = 'English'; // Map DB default schema value to 'English'
    const translations = TRANSLATIONS[lang] || TRANSLATIONS.English;
    return translations[key] || TRANSLATIONS.English[key] || key;
  }, [settings?.defaultLanguage]);

  // ── System theme: listen for OS preference changes ────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handler = () => {
      setSettings(prev => {
        if (prev.theme?.theme_type === 'system') applyTheme(prev.theme);
        return prev;
      });
    };
    mq?.addEventListener('change', handler);
    return () => mq?.removeEventListener('change', handler);
  }, [applyTheme]);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  // ── Handle RTL for Arabic layout direction ──────────────────────────────────
  useEffect(() => {
    let lang = settings?.defaultLanguage || 'English';
    if (lang === 'en') lang = 'English';
    document.documentElement.dir = lang === 'Arabic' ? 'rtl' : 'ltr';
  }, [settings?.defaultLanguage]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
};
