/**
 * Central list of the back-end API endpoints this front end will call once the
 * machine learning service and database are connected. Nothing here performs a
 * request today — the prototype still runs its models in the browser.
 *
 * Full request/response specification: docs/API_SPECIFICATION.md
 */
export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

export const API_ENDPOINTS = {
  auth: {
    /** POST — { username, password } → AuthSession */
    login: "/api/auth/login",
    /** POST — RegisterRequest → AuthSession */
    register: "/api/auth/register",
    /** POST — no body (bearer token) → 204 */
    logout: "/api/auth/logout",
    /** GET — bearer token → UserProfile */
    me: "/api/auth/me",
    /** POST — { refreshToken } → AuthSession */
    refresh: "/api/auth/refresh",
    /** GET — ?username= → { available } */
    usernameAvailable: "/api/auth/username-available",
    /** GET — ?email= → { available } */
    emailAvailable: "/api/auth/email-available",
    /** GET — no params → { allowed, reason } (one account per person) */
    registrationAllowed: "/api/auth/registration-allowed",
    /** POST — { termsVersion, medicalDataConsent } → 204 */
    consent: "/api/auth/consent",
    password: {
      /** POST — { username } → { maskedEmail, expiresInSeconds } */
      forgot: "/api/auth/password/forgot",
      /** POST — { username, code } → { resetToken } */
      verifyCode: "/api/auth/password/verify-code",
      /** POST — { username } → 202 */
      resendCode: "/api/auth/password/resend-code",
      /** POST — { resetToken, newPassword } → 204 */
      reset: "/api/auth/password/reset",
      /** POST — { currentPassword, newPassword } → 204 */
      change: "/api/auth/password/change",
    },
  },
  users: {
    /** GET — bearer token → UserProfile */
    me: "/api/users/me",
    /** PATCH — partial profile → UserProfile */
    update: "/api/users/me",
    /** DELETE — { password } → 204 */
    remove: "/api/users/me",
    /** GET — → { heightCm, weightKg, bmi, bmiCategory } */
    metrics: "/api/users/me/metrics",
    /** GET — → downloadable copy of the member's stored data */
    export: "/api/users/me/export",
  },
  ocr: {
    /** POST — multipart/form-data, form data key: file (JPEG/PNG only) → PredictionResponse */
    upload: "/api/ocr/upload",
    /** GET — no params → Array of OcrReport */
    history: "/api/ocr/history",
    /** GET / DELETE — one scanned report by id */
    report: (reportId: string) => `/api/ocr/history/${reportId}`,
  },
  predict: {
    /** POST — application/json, DiabetesInputDto → PredictionResponse */
    diabetes: "/api/predict/diabetes",
    /** POST — application/json, HeartInputDto → PredictionResponse */
    heart: "/api/predict/heart",
    /** POST — application/json, BreastCancerInputDto → PredictionResponse */
    breastCancer: "/api/predict/breast-cancer",
    /** POST — application/json, ParkinsonsInputDto → PredictionResponse */
    parkinsons: "/api/predict/parkinsons",
    /** GET — no params → Array of Prediction */
    history: "/api/predict/history",
    /** GET / DELETE — one stored prediction by id */
    record: (predictionId: string) => `/api/predict/history/${predictionId}`,
    /** GET — printable PDF of one stored prediction */
    pdf: (predictionId: string) => `/api/predict/history/${predictionId}/pdf`,
    /** GET — field definitions and allowed ranges for one disease */
    schema: (disease: string) => `/api/predict/${disease}/schema`,
  },
  /** GET — model version and accuracy information */
  models: "/api/models",
  activity: {
    /** POST — { type, detail, score } → 201 */
    record: "/api/activity",
    /** GET — ?page=&size= → Page<ActivityEvent> */
    mine: "/api/activity/me",
  },
  admin: {
    /** POST — { username, password } → AuthSession (role ADMIN) */
    login: "/api/admin/auth/login",
    /** GET — bearer token → admin profile */
    me: "/api/admin/auth/me",
    /** POST — no body → 204 */
    logout: "/api/admin/auth/logout",
    /** POST — { currentPassword, newPassword } → 204 */
    changePassword: "/api/admin/auth/password/change",
    /** GET — → { accounts, events, predictions, accountsNeedingCheck } */
    stats: "/api/admin/stats",
    /** GET — ?page=&size=&search=&sort= → Page<AdminUserRow> */
    users: "/api/admin/users",
    /** GET — one member with predictions and activity */
    user: (userId: string) => `/api/admin/users/${userId}`,
    /** DELETE — ?purgeActivity=true → 204 */
    deleteUser: (userId: string) => `/api/admin/users/${userId}`,
    /** POST — → 204 */
    suspendUser: (userId: string) => `/api/admin/users/${userId}/suspend`,
    /** POST — → 204 */
    reinstateUser: (userId: string) => `/api/admin/users/${userId}/reinstate`,
    /** POST — → 204 */
    forcePasswordReset: (userId: string) => `/api/admin/users/${userId}/force-password-reset`,
    /** GET — ?page=&size=&search=&type=&from=&to= → Page<ActivityEvent> */
    activity: "/api/admin/activity",
    /** GET — CSV download of the filtered activity log */
    activityExport: "/api/admin/activity/export.csv",
    /** DELETE — clears the whole activity log → 204 */
    clearActivity: "/api/admin/activity",
    /** GET — administrator audit trail */
    audit: "/api/admin/audit",
    analytics: {
      /** GET — [{ name, runs }] */
      byScreening: "/api/admin/analytics/by-screening",
      /** GET — ?days=7 → [{ day, logins, scans, predictions }] */
      daily: "/api/admin/analytics/daily",
      /** GET — [{ name, value }] low / moderate / elevated */
      riskSplit: "/api/admin/analytics/risk-split",
      /** GET — [{ disease, runs, avgScore, avgLatencyMs, modelVersion }] */
      modelPerformance: "/api/admin/analytics/model-performance",
      /** GET — { uploads, successRate, avgConfidence, avgProcessingMs } */
      ocr: "/api/admin/analytics/ocr",
    },
  },
  content: {
    /** GET — versioned legal text */
    terms: "/api/content/terms",
    privacy: "/api/content/privacy",
    cookiePolicy: "/api/content/cookie-policy",
    /** POST — { necessary, analytics } → 204 */
    cookieConsent: "/api/consent/cookies",
  },
  /** POST — { name, email, subject, message } → 202 */
  contact: "/api/contact",
  /** POST — member feedback or issue report */
  feedback: "/api/feedback",
  /** GET — { status, version, modelsLoaded } */
  health: "/api/health",
} as const;

/** Endpoint used for each disease key defined in src/lib/site.ts. */
export const PREDICT_ENDPOINT_BY_DISEASE: Record<string, string> = {
  heart: API_ENDPOINTS.predict.heart,
  diabetes: API_ENDPOINTS.predict.diabetes,
  "breast-cancer": API_ENDPOINTS.predict.breastCancer,
  parkinsons: API_ENDPOINTS.predict.parkinsons,
};

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
