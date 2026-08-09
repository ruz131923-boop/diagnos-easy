/**
 * Central list of the back-end API endpoints this front end will call once the
 * machine learning service and database are connected. Nothing here performs a
 * request today — the prototype still runs its models in the browser.
 */
export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

export const API_ENDPOINTS = {
  ocr: {
    /** POST — multipart/form-data, form data key: file (JPEG/PNG only) → PredictionResponse */
    upload: "/api/ocr/upload",
    /** GET — no params → Array of OcrReport */
    history: "/api/ocr/history",
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
  },
} as const;

/** Endpoint used for each disease key defined in src/lib/site.ts. */
export const PREDICT_ENDPOINT_BY_DISEASE: Record<string, string> = {
  heart: API_ENDPOINTS.predict.heart,
  diabetes: API_ENDPOINTS.predict.diabetes,
  "breast-cancer": API_ENDPOINTS.predict.breastCancer,
  parkinsons: API_ENDPOINTS.predict.parkinsons,
};

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
