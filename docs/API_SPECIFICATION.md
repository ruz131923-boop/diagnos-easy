# VitalSense — Front-End Action & Endpoint Specification

Every user-visible action in the current front end is listed below with the
backend endpoint it should call, the request payload, and the expected response.
Nothing is omitted: navigation-only actions are also listed and marked
**no endpoint needed**.

Base URL: `VITE_API_BASE_URL` (see `src/lib/api.ts`).
Auth: `Authorization: Bearer <accessToken>` on every endpoint marked **auth**.
All bodies are `application/json` unless stated otherwise.

Common error envelope:
```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Human readable text",
             "fields": { "contactNumber": "Must be exactly 10 digits" } } }
```
Status codes used: 200, 201, 204, 400, 401, 403, 404, 409, 413, 415, 422, 429, 500.

---

## 1. Account & session (member)

| # | UI action | Where | Method + endpoint | Request | Response |
|---|-----------|-------|-------------------|---------|----------|
| 1.1 | Check username availability (as typed) | `/register` step 3 | `GET /api/auth/username-available?username=` | – | `{ "available": true }` |
| 1.2 | Check email availability | `/register` step 1 | `GET /api/auth/email-available?email=` | – | `{ "available": true }` |
| 1.3 | Submit registration | `/register` | `POST /api/auth/register` | `RegisterRequest` | `201 AuthSession` |
| 1.4 | Log in | `/login` | `POST /api/auth/login` | `{ "username", "password" }` | `200 AuthSession` |
| 1.5 | Restore session on page load | `AuthProvider` | `GET /api/auth/me` **auth** | – | `UserProfile` |
| 1.6 | Refresh expired token | interceptor | `POST /api/auth/refresh` | `{ "refreshToken" }` | `AuthSession` |
| 1.7 | Log out | header / dashboard | `POST /api/auth/logout` **auth** | – | `204` |
| 1.8 | "One account per person" guard | `/register` | `GET /api/auth/registration-allowed` | – | `{ "allowed": false, "reason": "ACCOUNT_EXISTS" }` |
| 1.9 | Accept terms + medical-data consent checkbox | `/register` step 3 | part of 1.3 (`consent` object) — also `POST /api/auth/consent` **auth** for later re-consent | `{ "termsVersion": "1.0", "medicalDataConsent": true, "acceptedAt" }` | `204` |
| 1.10 | Delete my account | `/dashboard` | `DELETE /api/users/me` **auth** | `{ "password" }` (re-auth) | `204` |

**RegisterRequest**
```json
{
  "fullName": "string (2+ words)",
  "nameWithInitials": "string",
  "dateOfBirth": "YYYY-MM-DD (age 1-120)",
  "gender": "Female | Male | Other | Prefer not to say",
  "email": "email",
  "contactNumber": "string, exactly 10 digits",
  "heightCm": "number 50-250",
  "weightKg": "number 10-300",
  "bloodGroup": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "username": "string 3-20, unique",
  "password": "min 8 chars, >=1 letter, >=1 number, >=1 special char",
  "consent": { "termsVersion": "1.0", "medicalDataConsent": true }
}
```

**AuthSession**
```json
{ "accessToken": "jwt", "refreshToken": "jwt", "expiresIn": 3600,
  "user": { "...UserProfile" } }
```

**UserProfile** = registration fields minus `password`, plus
`{ "id", "role": "USER|ADMIN", "bmi": 24.6, "createdAt", "lastLoginAt" }`.

---

## 2. Password recovery (3-step flow on `/forgot-password`)

| # | UI action | Method + endpoint | Request | Response |
|---|-----------|-------------------|---------|----------|
| 2.1 | Step 1 — verify username, send code | `POST /api/auth/password/forgot` | `{ "username" }` | `202 { "maskedEmail": "j***@mail.com", "expiresInSeconds": 600 }` |
| 2.2 | Step 2 — verify 6-digit code | `POST /api/auth/password/verify-code` | `{ "username", "code": "123456" }` | `200 { "resetToken": "opaque", "expiresInSeconds": 600 }` |
| 2.3 | Resend code | `POST /api/auth/password/resend-code` | `{ "username" }` | `202` (rate-limited 429) |
| 2.4 | Step 3 — set new password | `POST /api/auth/password/reset` | `{ "resetToken", "newPassword" }` | `204` |
| 2.5 | Change password while logged in (future) | `POST /api/auth/password/change` **auth** | `{ "currentPassword", "newPassword" }` | `204` |

---

## 3. Member profile & dashboard

| # | UI action | Method + endpoint | Notes |
|---|-----------|-------------------|-------|
| 3.1 | Load "Registered profile" card | `GET /api/users/me` **auth** | returns `UserProfile` |
| 3.2 | Body-metrics / BMI card | included in 3.1 as `bmi`, or `GET /api/users/me/metrics` **auth** → `{ "heightCm", "weightKg", "bmi", "bmiCategory" }` |
| 3.3 | Edit profile / height / weight (future) | `PATCH /api/users/me` **auth** | partial `RegisterRequest` fields |
| 3.4 | Prediction history panel ("will appear here") | `GET /api/predict/history?page=&size=&disease=` **auth** | `Page<PredictionRecord>` |
| 3.5 | Open one past result | `GET /api/predict/history/{predictionId}` **auth** | `PredictionRecord` |
| 3.6 | Delete one past result | `DELETE /api/predict/history/{predictionId}` **auth** | `204` |
| 3.7 | Download my data (GDPR-style, from Privacy page) | `GET /api/users/me/export` **auth** | `200` JSON/ZIP attachment |
| 3.8 | Auto-prefill Age / Sex / BMI on disease forms | uses 3.1 — **no extra endpoint** |
| 3.9 | Cards linking to disease pages | **no endpoint needed** |

---

## 4. OCR report scanning (heart & diabetes pages)

| # | UI action | Method + endpoint | Request | Response |
|---|-----------|-------------------|---------|----------|
| 4.1 | Upload & scan a report | `POST /api/ocr/upload` **auth** | `multipart/form-data`, key `file` (PDF/JPG/PNG, ≤10 MB), optional `disease=heart\|diabetes` | `OcrResult` |
| 4.2 | Upload progress bar | client-side XHR progress — **no endpoint** |
| 4.3 | Scan history list | `GET /api/ocr/history?page=&size=` **auth** | – | `Page<OcrReport>` |
| 4.4 | View one scanned report | `GET /api/ocr/history/{reportId}` **auth** | – | `OcrReport` |
| 4.5 | Delete a scanned report | `DELETE /api/ocr/history/{reportId}` **auth** | – | `204` |
| 4.6 | Cancel an in-flight scan | client aborts request; optional `POST /api/ocr/{jobId}/cancel` **auth** |

**OcrResult**
```json
{ "reportId": "uuid", "fileName": "report.pdf", "pages": 2,
  "confidence": 0.93,
  "extracted": [ { "field": "cholesterol", "label": "Serum cholesterol (mg/dL)",
                   "value": "228", "unit": "mg/dL", "confidence": 0.97 } ],
  "unmatchedText": ["..."], "scannedAt": "ISO-8601" }
```
`field` MUST use the exact form field names in §5 so the front end can prefill.
Errors: `415` unsupported type, `413` too large, `422 OCR_UNREADABLE`.

---

## 5. Prediction endpoints (one per disease)

All are `POST`, **auth**, `application/json`, and return **PredictionResponse**.
Missing/out-of-range values → `422` with per-field messages.

**PredictionResponse**
```json
{ "predictionId": "uuid", "disease": "heart",
  "score": 62, "level": "low|moderate|high",
  "headline": "string", "detail": "string",
  "factors": [ { "label": "Blood pressure", "weight": 71 } ],
  "advice": ["string"],
  "modelVersion": "heart-rf-1.2", "createdAt": "ISO-8601" }
```

### 5.1 `POST /api/predict/heart` — HeartInputDto
| Field | Type | Range / values | OCR |
|---|---|---|---|
| age | int | 1–120 | – |
| sex | enum | Female, Male | – |
| chestPain | enum | Typical angina, Atypical angina, Non-anginal pain, No chest pain | – |
| restingBp | number | 60–250 mm Hg | ✔ |
| cholesterol | number | 80–600 mg/dL | ✔ |
| fastingBloodSugar | enum | No, Yes (>120 mg/dL) | ✔ |
| restEcg | enum | Normal, ST-T wave abnormality, Left ventricular enlargement (hypertrophy) | ✔ |
| maxHeartRate | int | 50–230 bpm | ✔ |
| exerciseAngina | enum | No, Yes | – |
| stDepression | number | 0–7 mm (oldpeak) | ✔ |
| stSlope | enum | Upward sloping, Flat, Downward sloping | ✔ |
| majorVessels | int | 0–3 (ca) | – |
| thalassemia | enum | Normal, Fixed defect, Reversible defect | – |
| smoker | enum | No, Yes | – |

### 5.2 `POST /api/predict/diabetes` — DiabetesInputDto
| Field | Type | Range | OCR |
|---|---|---|---|
| age | int | 1–120 | – |
| pregnancies | int | 0–20 | – |
| glucose | number | 40–500 mg/dL | ✔ |
| bloodPressure | number | 30–150 mm Hg (diastolic) | ✔ |
| skinThickness | number | 5–100 mm (triceps fold) | ✔ |
| insulin | number | 1–900 µU/mL | ✔ |
| bmi | number | 10–70 kg/m² | – |
| dpf | number | 0.05–2.5 (diabetes pedigree function) | – |
| familyHistory | enum | No, Yes | – |
| activity | enum | Often (4 or more days), Sometimes (1 to 3 days), Rarely or never | – |

### 5.3 `POST /api/predict/breast-cancer` — BreastCancerInputDto
| Field | Type | Range |
|---|---|---|
| radiusMean | number | 5–40 |
| textureMean | number | 5–60 |
| perimeterMean | number | 30–260 |
| areaMean | number | 100–3000 |
| smoothnessMean | number | 0–1 |
| compactnessMean | number | 0–1 |
| concavityMean | number | 0–1 |
| concavePointsMean | number | 0–1 |
| familyHistory | enum | No, Yes |
| lump | enum | No, Yes |

### 5.4 `POST /api/predict/parkinsons` — ParkinsonsInputDto
| Field | Meaning | Range |
|---|---|---|
| age | years | 1–120 |
| fo | average vocal fundamental frequency (Hz) | 50–300 |
| fhi | highest fundamental frequency (Hz) | 60–600 |
| flo | lowest fundamental frequency (Hz) | 50–300 |
| jitterPercent | jitter (%) | 0–5 |
| jitterAbs | jitter absolute (s) | 0–0.001 |
| rap | relative average perturbation | 0–0.05 |
| ppq | five-point period perturbation quotient | 0–0.05 |
| ddp | avg diff of consecutive periods | 0–0.15 |
| shimmer | shimmer ratio | 0–0.3 |
| shimmerDb | shimmer (dB) | 0–3 |
| apq3 | three-point amplitude quotient | 0–0.2 |
| apq5 | five-point amplitude quotient | 0–0.2 |
| dda | avg abs diff of amplitude cycles | 0–0.2 |
| nhr | noise-to-harmonics ratio | 0–1 |
| hnr | harmonics-to-noise ratio (dB) | 0–40 |
| rpde | recurrence period density entropy | 0–1 |
| dfa | detrended fluctuation analysis | 0–1 |
| spread1 | pitch variation 1 (absolute value) | 0–10 |
| spread2 | pitch variation 2 | 0–1 |
| d2 | correlation dimension | 0–5 |
| ppe | pitch period entropy | 0–1 |
| tremor | resting hand tremor | No, Mild, Strong |
| rigidity | muscle stiffness | No, Mild, Strong |
| bradykinesia | slowed movement | No, Mild, Strong |
| handwriting | handwriting smaller | No, Yes |

### 5.5 Prediction support endpoints
| # | UI action | Endpoint |
|---|-----------|----------|
| 5.5.1 | "Clear form" button | **no endpoint** (client state) |
| 5.5.2 | Load field definitions/ranges from server (keeps UI and model in sync) | `GET /api/predict/{disease}/schema` → `FieldDef[]` |
| 5.5.3 | Download result as PDF | `GET /api/predict/history/{predictionId}/pdf` **auth** |
| 5.5.4 | Model info shown on How-it-works | `GET /api/models` → `[{ "disease", "version", "accuracy", "trainedAt", "dataset" }]` |

---

## 6. Activity log (feeds the admin dashboard)

Client currently writes to `localStorage` via `src/lib/activity.ts`.
Server equivalent:

| # | Event | Endpoint |
|---|-------|----------|
| 6.1 | Record any event (register, login, logout, prediction, report-scan, account-deleted, admin-login) | `POST /api/activity` **auth** — `{ "type", "detail", "score" }` → `201` (server should log 1.3/1.4/1.7/4.1/5.x automatically; this is for client-only events) |
| 6.2 | My own activity (member view) | `GET /api/activity/me?page=&size=` **auth** |

**ActivityEvent**
```json
{ "id", "at": "ISO-8601", "username", "userId",
  "type": "register|login|logout|prediction|report-scan|account-deleted|admin-login",
  "detail": "Heart disease screening", "score": 62,
  "ipAddress": "1.2.3.4", "userAgent": "..." }
```

---

## 7. Administrator

| # | UI action | Method + endpoint | Request / Response |
|---|-----------|-------------------|--------------------|
| 7.1 | Admin login (`/admin-login`) | `POST /api/admin/auth/login` | `{ "username", "password" }` → `AuthSession` with `role: "ADMIN"`; `403` for member credentials |
| 7.2 | Restore admin session | `GET /api/admin/auth/me` **admin** | admin profile |
| 7.3 | Log out of admin | `POST /api/admin/auth/logout` **admin** | `204` |
| 7.4 | Four summary stat cards | `GET /api/admin/stats` **admin** | `{ "accounts", "events", "predictions", "accountsNeedingCheck" }` |
| 7.5 | "Predictions by screening" bar chart | `GET /api/admin/analytics/by-screening` **admin** | `[{ "name": "Heart disease screening", "runs": 12 }]` |
| 7.6 | "Usage over the last 7 days" line chart | `GET /api/admin/analytics/daily?days=7` **admin** | `[{ "day": "2026-08-11", "logins", "scans", "predictions" }]` |
| 7.7 | "Risk levels predicted" pie chart | `GET /api/admin/analytics/risk-split` **admin** | `[{ "name": "Low risk", "value": 8 }]` |
| 7.8 | "Activity per member" bar chart + accounts table | `GET /api/admin/users?page=&size=&search=&sort=` **admin** | `Page<AdminUserRow>` |
| 7.9 | Full activity log table | `GET /api/admin/activity?page=&size=&search=&type=&from=&to=` **admin** | `Page<ActivityEvent>` |
| 7.10 | Search box + action filter | query params of 7.9 — **no separate endpoint** |
| 7.11 | Export activity to CSV | `GET /api/admin/activity/export.csv?search=&type=` **admin** | `text/csv` attachment |
| 7.12 | Clear activity log | `DELETE /api/admin/activity` **admin** | `204` |
| 7.13 | Refresh data button | re-calls 7.4–7.9 — **no new endpoint** |
| 7.14 | Remove a fake/unauthorised account (2-step confirm) | `DELETE /api/admin/users/{userId}?purgeActivity=true` **admin** | `204` |
| 7.15 | Suspicion flags ("Needs a check") | computed server-side in 7.8 as `flags: ["Email address looks invalid", ...]` |
| 7.16 | Suspend / reinstate an account (recommended addition) | `POST /api/admin/users/{userId}/suspend` · `/reinstate` **admin** | `204` |
| 7.17 | Force password reset for a member (recommended) | `POST /api/admin/users/{userId}/force-password-reset` **admin** | `204` |
| 7.18 | View one member in detail (recommended) | `GET /api/admin/users/{userId}` **admin** | profile + predictions + activity |
| 7.19 | Model performance comparison (recommended) | `GET /api/admin/analytics/model-performance` **admin** | `[{ "disease", "runs", "avgScore", "avgLatencyMs", "modelVersion" }]` |
| 7.20 | OCR performance (recommended) | `GET /api/admin/analytics/ocr` **admin** | `{ "uploads", "successRate", "avgConfidence", "avgProcessingMs" }` |
| 7.21 | Change admin password (recommended) | `POST /api/admin/auth/password/change` **admin** | `{ "currentPassword", "newPassword" }` |
| 7.22 | Admin audit trail (recommended) | `GET /api/admin/audit` **admin** | who deleted/suspended what and when |

**AdminUserRow**
```json
{ "userId", "username", "fullName", "gender", "dateOfBirth", "email",
  "contactNumber", "bmi": 24.6, "events": 14, "predictions": 5, "scans": 2,
  "logins": 7, "avgRisk": 41, "lastSeen": "ISO-8601",
  "status": "ACTIVE|SUSPENDED", "flags": ["No prediction activity yet"] }
```

---

## 8. Content, legal & contact pages

| # | UI action | Endpoint |
|---|-----------|----------|
| 8.1 | Terms & Conditions text | `GET /api/content/terms` → `{ "version", "updatedAt", "html" }` (or keep static — **optional**) |
| 8.2 | Privacy Policy | `GET /api/content/privacy` (optional) |
| 8.3 | Cookie Policy + cookie banner choice | `GET /api/content/cookie-policy`; `POST /api/consent/cookies` `{ "analytics": false, "necessary": true }` |
| 8.4 | Contact / support message form (About page) | `POST /api/contact` — `{ "name", "email", "subject", "message" }` → `202` |
| 8.5 | Report an issue / feedback (recommended) | `POST /api/feedback` **auth** |
| 8.6 | About, How it works, Home, footer links, disclaimers | **no endpoint needed** (static content) |
| 8.7 | Service health (used by a status badge / uptime check) | `GET /api/health` → `{ "status": "ok", "version", "modelsLoaded": true }` |

---

## 9. Cross-cutting requirements for the backend

1. **Validation must mirror §5 ranges exactly** and reject negatives; return `422` with a `fields` map so the existing inline error UI can display it.
2. **One account per person** — unique constraints on `username`, `email`, and `contactNumber`; `409 ACCOUNT_EXISTS`.
3. **Password policy** — min 8 chars with at least one letter, one number and one special character; store as bcrypt/argon2.
4. **Contact number** — exactly 10 digits.
5. **Role separation** — all `/api/admin/**` routes require `role = ADMIN`; a member token must get `403`, never data.
6. **Rate limiting** — login (5/min), password recovery (3/10 min), OCR upload (10/hour).
7. **File rules** — OCR accepts PDF/JPEG/PNG only, ≤10 MB; scan for malware; store encrypted; medical data retained only with consent (§1.9).
8. **Pagination envelope** — `{ "items": [], "page": 0, "size": 20, "total": 0 }`.
9. **Timestamps** — ISO-8601 UTC everywhere; the UI formats locally.
10. **CORS** — allow the front-end origin, `Authorization` header, credentials as needed.
