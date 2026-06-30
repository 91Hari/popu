# PO.PU — Legal, Regulatory & Financial Compliance Audit

**Document Type:** Compliance Blueprint & Gap Analysis  
**Scope:** Full-stack audit — Backend, Frontend, Database, Payment, Tax, Legal  
**Jurisdiction:** Republic of India  
**Prepared for:** Legal Counsel, FinTech Compliance, Pre-Launch Review  
**Date:** June 2026  
**Classification:** Confidential

---

## 1. Executive Summary

PO.PU is a multi-sided food marketplace connecting Customers, Caterers (home chefs / cloud kitchens), Delivery Riders, and Administrators. The platform supports food ordering, tiffin subscriptions, event catering, self-pickup, COD, and online payments via PhonePe. Commission is architecturally designed (fields exist in the database) but is currently set to 0%.

**Overall Production Readiness Score: 38 / 100**

The platform is technically functional but legally unlaunchable in its current state for the following primary reasons:

1. No terms, privacy policy, or consent capture at registration for any user type
2. No FSSAI license verification for caterers — food safety liability sits entirely with the platform
3. Manual UPI payment proof uploads create illegal money-handling obligations not covered by any payment aggregator license
4. No settlement mechanism exists — platform collects customer money with no contractual or technical path to pay caterers
5. No GST, TDS, or TCS implementation despite handling financial transactions
6. Riders have zero KYC, identity, license, or insurance verification
7. No grievance officer, escalation mechanism, or consumer complaint workflow as required under the Consumer Protection Act 2019

The roadmap at the end of this document provides a phased path to full compliance.

---

## 2. Section 1 — Payment & Financial Regulations

### 2.1 Current Implementation (What Actually Exists)

From reading the code directly:

- **PhonePe Standard Checkout v2** is the primary payment gateway. Integration is technically correct: cart snapshot is stored before payment initiation, order is created only after PhonePe confirms `COMPLETED`, webhook handler uses `SELECT FOR UPDATE` to prevent double-fulfillment. This is good engineering.
- **Cash on Delivery (COD)** is supported. Cash is confirmed by the rider (`payment_collected_at`, `payment_collected_by_rider` columns). No digital trail of the cash amount received.
- **Manual UPI Payment Proofs** (`payment_proofs` table) allow customers to upload a payment screenshot. A caterer reviews and approves it. The platform is not involved in the actual money movement.
- **Commission architecture exists** (`commission_percentage`, `commission_amount`, `platform_fee`, `caterer_payout` in `caterer_orders`). Values are calculated by `paymentCalculationService.js` and snapshot-stored per order. Currently all zero.
- **Refund flow** exists via PhonePe API. Initiated when a caterer cancels a paid order. Records stored in `refunds` table.
- **No settlement mechanism exists.** Money collected via PhonePe goes to the platform's merchant account. There is no code, table, or workflow to disburse `caterer_payout` amounts to individual caterers.

### 2.2 Money Flow (Current, Actual)

```
Customer pays ₹X via PhonePe
        ↓
PhonePe credits ₹X to PO.PU Merchant Account
        ↓
PO.PU creates order, caterer_payout = ₹X (commission = 0%)
        ↓
[ NOTHING HAPPENS — no payout to caterer ]
        ↓
Caterer fulfils order expecting to receive payment
        ↓
No automated settlement exists
```

**This is the single largest financial and legal risk in the entire platform.**

### 2.3 RBI & Payment Aggregator Implications

| Issue | Regulation | Risk Level |
|---|---|---|
| Platform collects customer money via PhonePe, holds it, and does not pass it to the caterer through any regulated mechanism | RBI Payment Aggregator Guidelines, March 2020 | **CRITICAL** |
| Manual UPI proof uploads constitute the platform acting as an unregulated intermediary in a payment transaction | RBI PA/PG Guidelines | **CRITICAL** |
| No escrow or nodal account arrangement for funds in transit | RBI PA Guidelines Clause 8 | **CRITICAL** |
| COD cash collection by rider with no reconciliation to platform | RBI Guidelines, Accounting Standards | **HIGH** |

**RBI Payment Aggregator (PA) Position:**

Under the RBI PA guidelines (March 2020, updated 2023), any entity that receives payments from customers on behalf of merchants (caterers, in this case) and settles those payments to the merchants is considered a **Payment Aggregator** and requires an RBI PA license. PO.PU is currently operating in this capacity technically but with zero settlement infrastructure.

**Options to address this:**

**Option A (Recommended for MVP):** Integrate with a licensed Payment Aggregator (Razorpay, Cashfree, or Cashfree Marketplace) for **marketplace split payments**. The PA handles the regulated split — customer pays ₹X, PA automatically splits it as ₹(X - commission) to caterer and ₹commission to PO.PU. PO.PU never holds the caterer's money. This eliminates the PA license requirement for PO.PU.

**Option B (Future):** Apply for RBI PA license (minimum net worth ₹25 crore, audited financials, extensive compliance framework). Not viable for current scale.

**Option C (Short-term only):** Operate at 0% commission, collect no fees, and ensure caterers bill customers directly — PO.PU acts purely as a **Payment Gateway** (not aggregator). This limits the business model.

### 2.4 Manual UPI Proof — Specific Risk

The `payment_proofs` table and the screenshot upload flow create a situation where:
- The customer claims to have paid the caterer directly
- The platform reviews the screenshot and marks payment as `APPROVED`
- No money actually flows through the platform

This appears safe but creates risks:
- **Fake screenshots** — platform has no way to verify authenticity
- **Consumer disputes** — customer claims they paid, caterer claims they didn't, platform is in the middle with no verified record
- **RBI classification** — if this is used to bypass the PhonePe flow, regulators may view the platform as facilitating unregulated payments
- **No refund path** — if the caterer cancels after screenshot approval, no automated refund mechanism exists

**Recommendation:** Restrict payment proofs to COD confirmation only. All digital payments must go through the PhonePe (or PA marketplace) flow.

### 2.5 Required Settlement Architecture

The following must be built before charging commission:

```
Customer pays ₹X (PhonePe / PA)
        ↓
PA holds in nodal/escrow account
        ↓
Order fulfilled (DELIVERED / COLLECTED)
        ↓
Settlement triggered:
  - Caterer receives: ₹(X - commission - platform_fee)
  - PO.PU receives:   ₹(commission + platform_fee)
        ↓
settlement_records row created
        ↓
commission_invoice generated (GST-compliant)
        ↓
Caterer payout via NEFT/IMPS/UPI
```

### 2.6 Missing Database Fields for Financial Compliance

| Missing | Required For |
|---|---|
| No `settlement_records` table | Payout tracking, regulatory audit |
| No `settlement_status` on `caterer_orders` | Know if caterer has been paid |
| No `settled_at` timestamp | Settlement audit trail |
| No `settlement_batch_id` | Batch payout reconciliation |
| No bank account / IFSC for caterer payout | Cannot do NEFT/IMPS settlement |
| No `tax_invoices` table | GST compliance |
| No `tds_deductions` table | TDS compliance |

---

## 3. Section 2 — GST & Tax Compliance (India)

### 3.1 Current Status

**Zero GST implementation exists anywhere in the codebase or database.**

There are no GST registration numbers collected, no GST calculation fields, no invoice generation, no GST reports, and no tax document storage.

### 3.2 GST Applicability to PO.PU

PO.PU operates as an **Electronic Commerce Operator (ECO)** under Section 9(5) of the CGST Act, 2017. This has specific and mandatory implications.

#### GST on Food Orders (Section 9(5) CGST)

Under the 2022 amendment (effective 1 January 2022), **food delivery platforms are liable to pay GST on restaurant/food services supplied through them**, even if the restaurant/caterer would otherwise be exempt. The rate is **5% GST (no ITC)** on the food order value.

This means:
- PO.PU must collect and remit 5% GST on every food order delivered through the platform
- This applies regardless of whether the individual caterer is GST-registered
- PO.PU must file GSTR-1, GSTR-3B as an ECO

**This is not optional.** GSTN has specifically named food delivery aggregators under Section 9(5). Non-compliance attracts penalties and back-tax demands.

#### GST on PO.PU Commission (When Enabled)

When commission is activated:
- Commission charged to caterers = taxable supply of "intermediary services"
- GST rate: **18% (CGST 9% + SGST 9%)**
- PO.PU must issue a GST-compliant commission invoice to each caterer for each settlement period
- Caterer can claim ITC if they are GST-registered

#### GST Registration Threshold

If aggregate turnover exceeds ₹20 lakhs (₹10 lakhs for special category states), GST registration is mandatory. Given PO.PU handles payment collection, this threshold may be reached quickly.

### 3.3 TDS Implications

**Section 194-O (TDS by ECO):**
- Effective from 1 October 2020
- PO.PU (as ECO) must deduct **1% TDS** on the gross amount of sales facilitated through it for each caterer in a financial year
- Threshold: ₹5,00,000 aggregate in a financial year per caterer
- Deducted at the time of credit or payment, whichever is earlier
- PO.PU must file quarterly TDS returns (Form 26Q)
- Issue Form 16A to each caterer annually

**TCS under Section 52 (CGST):**
- PO.PU must collect **1% TCS** from caterers on net taxable value of supplies
- File GSTR-8 monthly

### 3.4 Missing Tax Infrastructure

| Requirement | Status |
|---|---|
| GST number collection from caterers | Missing |
| PAN number collection from caterers | Missing |
| PAN number collection from customers (high-value) | Missing |
| GST rate table per food category | Missing |
| Tax-inclusive price display to customer | Missing |
| GST invoice generation (customer) | Missing |
| Commission invoice to caterer | Missing |
| TDS deduction calculation | Missing |
| TDS certificate (Form 16A) generation | Missing |
| GSTR-1 data export | Missing |
| GSTR-3B data export | Missing |
| GSTR-8 data export | Missing |
| Annual TDS return data | Missing |
| Settlement statement with tax breakdown | Missing |

### 3.5 Required Database Fields for Tax Compliance

```sql
-- Add to users (caterer-specific)
ALTER TABLE users ADD COLUMN gst_number       VARCHAR(15);
ALTER TABLE users ADD COLUMN pan_number       VARCHAR(10);
ALTER TABLE users ADD COLUMN gst_verified     BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN bank_account_no  VARCHAR(30);
ALTER TABLE users ADD COLUMN bank_ifsc        VARCHAR(11);
ALTER TABLE users ADD COLUMN bank_name        VARCHAR(100);

-- New tables
CREATE TABLE tax_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   VARCHAR(30) UNIQUE NOT NULL,
  invoice_type     VARCHAR(20) NOT NULL, -- 'CUSTOMER_RECEIPT','COMMISSION_INVOICE','TDS_CERTIFICATE'
  party_id         UUID REFERENCES users(id),
  order_ref_id     UUID,
  taxable_amount   NUMERIC(12,2),
  gst_rate         NUMERIC(5,2),
  cgst_amount      NUMERIC(12,2),
  sgst_amount      NUMERIC(12,2),
  igst_amount      NUMERIC(12,2),
  total_amount     NUMERIC(12,2),
  financial_year   VARCHAR(9),
  invoice_date     DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tds_deductions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID REFERENCES users(id),
  financial_year   VARCHAR(9),
  quarter          SMALLINT CHECK (quarter BETWEEN 1 AND 4),
  gross_amount     NUMERIC(12,2),
  tds_rate         NUMERIC(5,2) DEFAULT 1.00,
  tds_amount       NUMERIC(12,2),
  deducted_at      TIMESTAMPTZ,
  deposited_at     TIMESTAMPTZ,
  challan_number   VARCHAR(50),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlement_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID REFERENCES users(id),
  period_from      DATE,
  period_to        DATE,
  gross_amount     NUMERIC(12,2),
  commission_amount NUMERIC(12,2),
  platform_fee     NUMERIC(12,2),
  tds_deducted     NUMERIC(12,2),
  gst_on_commission NUMERIC(12,2),
  net_payout       NUMERIC(12,2),
  status           VARCHAR(20) DEFAULT 'PENDING',
  payment_ref      VARCHAR(100),
  settled_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Section 3 — Vendor (Caterer) Agreements

### 4.1 Current Status

There are **no caterer agreements of any kind** in the system. A caterer can register, start listing food, and begin receiving orders without accepting any terms, disclosing any business information, or agreeing to any obligations.

### 4.2 Missing from Caterer Onboarding

| Requirement | Current Status | Risk |
|---|---|---|
| FSSAI License Number | Not collected | CRITICAL — platform is liable for food safety |
| PAN Number | Not collected | CRITICAL — TDS obligation |
| GST Number | Not collected | CRITICAL — TCS, ECO obligations |
| Bank Account + IFSC | Not collected (only UPI ID) | HIGH — cannot do formal settlements |
| Identity Proof (Aadhaar/Passport) | Not collected | HIGH — KYC obligation |
| Marketplace Agreement acceptance | Not collected | CRITICAL — no contract exists |
| SLA acceptance | Not collected | HIGH |
| Food hygiene declaration | Not collected | HIGH |
| Commission clause agreement | Not collected | CRITICAL before enabling commission |

### 4.3 Required Caterer Agreement — Key Clauses

The following must be in a digitally accepted Vendor Agreement:

**A. Business & KYC**
- Full legal name of proprietor / partnership / company
- Business registration type (proprietorship, LLP, Pvt Ltd, etc.)
- FSSAI License number and expiry date
- PAN / TAN number
- GST registration number (if registered)
- Bank account details for settlement

**B. Marketplace Relationship**
- Caterer is an independent seller; PO.PU is an intermediary marketplace, not a buyer or reseller
- Caterer sets their own prices; PO.PU does not guarantee minimum orders
- Relationship is principal-to-principal, not employer-to-employee

**C. Commission & Settlement**
- Current commission rate: 0%
- PO.PU reserves the right to introduce commission with 30-day written notice
- Settlement cycle: weekly / bi-weekly (specify)
- TDS will be deducted at applicable rates
- Platform fee (if any) will be disclosed per order

**D. Food Safety Obligations**
- Caterer is solely responsible for food quality, hygiene, and safety
- Must maintain valid FSSAI license at all times
- PO.PU is indemnified for any food safety claims arising from caterer's product
- Caterer must accurately describe allergens, veg/non-veg classification

**E. Order Obligations**
- Accept or reject orders within [X] minutes; auto-cancellation beyond this window
- Maintain listed preparation times; accuracy is a performance metric
- Refund responsibility: if caterer cancels after customer payment, full refund is triggered automatically
- No cash collection from customers on online orders

**F. Suspension & Termination**
- Grounds for immediate suspension: food safety complaint, FSSAI expiry, fraud
- Grounds for termination: repeated cancellations, customer abuse, regulatory violation
- 30-day notice for convenience termination by either party

**G. Intellectual Property**
- Food photos uploaded to PO.PU: caterer grants PO.PU a non-exclusive license to display them
- PO.PU brand / trademarks: caterer may not misrepresent association

**H. Data Usage**
- Order data, customer reviews, and performance analytics are owned by PO.PU
- Caterer data is shared only as required by law or for operations
- Caterer may not contact customers outside the PO.PU platform

**I. Indemnity & Liability**
- Caterer indemnifies PO.PU for all claims arising from food quality, hygiene, or safety
- PO.PU liability to caterer is limited to the settled commission value
- PO.PU is not liable for payment gateway failures beyond its control

**J. Digital Acceptance**
- Agreement must be shown as a scrollable document during registration
- "I accept the Vendor Agreement" checkbox must be explicitly checked
- Timestamp, IP address, and device fingerprint must be recorded in `legal_consents` table
- Agreement version number must be stored; new versions require fresh acceptance

---

## 5. Section 4 — Consumer Protection

### 5.1 Consumer Protection Act 2019 — Mandatory Requirements

| Requirement | Current Status |
|---|---|
| Grievance Officer designation with name, email, phone published on app | **Missing** |
| 48-hour complaint acknowledgement mechanism | **Missing** |
| Clearly stated refund policy before checkout | **Missing** |
| Total price (inclusive of all charges) shown before payment | **Partial** — delivery charges not always shown |
| Terms & Conditions accepted at registration | **Missing** |
| Privacy Policy accepted at registration | **Missing** |
| Cancellation policy visible before order placement | **Missing** |
| Order confirmation with all details via email/SMS | **Partial** — notifications exist, no formal confirmation document |

### 5.2 Current Customer Journey — Compliance Gaps

**Registration:**
- Email and password collected with no T&C acceptance, no privacy policy consent, no marketing consent
- No age verification (platform may serve minors — food is a sensitive category)

**Order Placement:**
- Price displayed is the food item price only; delivery charge and platform fee (when enabled) not shown as a line item before payment
- No disclosure of what commission structure applies
- No estimated delivery window guarantee

**Payment:**
- PhonePe flow is technically correct
- Screenshot proof flow (for caterer-direct UPI) has no consumer protection — disputed payments have no resolution path

**Post-Order:**
- No formal order confirmation document (email with itemised receipt)
- No guaranteed callback time if order is delayed
- Auto-cancellation exists but no consumer notification of the policy upfront

**Refunds:**
- Refund is initiated automatically on caterer cancellation — this is good
- No SLA on refund timeline communicated to customer (PhonePe typically takes 5–7 business days)
- No refund tracking page for customers
- No refund path for COD orders

**Complaints:**
- No in-app complaint workflow
- No grievance ticket system
- No escalation path beyond the notification system

### 5.3 E-Commerce Rules 2020 (Consumer Protection)

Under the Consumer Protection (E-Commerce) Rules 2020:

| Obligation | Status |
|---|---|
| Display seller (caterer) name, address, and contact on listing | **Missing** |
| Display FSSAI number of caterer on food listing | **Missing** |
| Publish return / refund / exchange policy | **Missing** |
| Publish shipping / delivery policy | **Missing** |
| Provide secure payment page with payment receipt | **Partial** |
| Grievance Redressal Mechanism with officer details | **Missing** |
| Country of Origin for products | **Not applicable for food** |
| Nodal officer for government/court notices | **Missing** |

---

## 6. Section 5 — Data Privacy & Security

### 6.1 Personal Data Collected (Actual, from Schema)

| Data Category | Where Stored | Sensitivity |
|---|---|---|
| Name, Email, Password Hash | `users` | High |
| Mobile Number | `users.mobile_number` | High |
| Date of Birth, Gender | `users` (migration 021) | Medium |
| Home Address, Pincode | `user_addresses` | High |
| Latitude / Longitude (home) | `users`, `user_addresses` | High |
| Real-time GPS location | `rider_locations` (per 30s) | Very High |
| Customer GPS at order time | `master_orders.customer_lat/lng` | High |
| Payment Method (UPI ID) | `users.upi_id`, `user_payment_methods` | High |
| Payment Screenshots | `payment_proofs.payment_screenshot_url` | Very High |
| Order History | `master_orders`, `caterer_orders` | Medium |
| Device Push Token | `notifications` (FCM token implied) | Medium |

### 6.2 Digital Personal Data Protection Act 2023 (DPDPA)

India's DPDPA 2023 (enforcement expected 2024–2025) requires:

| Obligation | Status |
|---|---|
| Explicit, informed consent before processing personal data | **Missing** |
| Purpose limitation — data used only for stated purpose | **Partially implemented** (data used for ops but not stated) |
| Data Minimisation — collect only what is necessary | **Partial** — date of birth / gender may not be necessary |
| Right to Access — user can request their data | **Missing** |
| Right to Erasure — account deletion removes personal data | **Partial** — `is_deleted` flag exists but data is not anonymised |
| Data Principal rights notification | **Missing** |
| Data Fiduciary registration (if applicable) | **To be assessed** |
| Cross-border data transfer restrictions | **To assess** — Render/Vercel servers location |
| Breach notification (72 hours to CERT-In) | **No mechanism** |
| Consent Manager integration | **Missing** |

### 6.3 Specific Risks

**GPS Data:**
- `rider_locations` table stores real-time GPS breadcrumbs indefinitely (no purge mechanism)
- Customer coordinates stored in `master_orders` indefinitely
- No user consent for location tracking beyond "location permission"

**Payment Screenshots:**
- `payment_proofs.payment_screenshot_url` stores bank/UPI screenshots
- These may contain sensitive financial information
- No defined retention period or deletion policy
- Storage provider not specified (S3/Cloudinary — wherever image URLs point)

**Account Deletion:**
- `users.is_deleted` flag exists but no anonymisation of PII
- After deletion, name, email, phone, address data persists in the database
- DPDPA requires actual erasure or anonymisation

### 6.4 Required Privacy Infrastructure

- Privacy Policy document (published in-app)
- Cookie/tracking consent (web)
- Location consent screen (explain why location is needed, how it is stored)
- Marketing consent (separate from functional consent)
- Data retention policy (define retention periods per data type)
- Account deletion with PII anonymisation
- Data export on request (`/api/profile/export` endpoint needed)
- Breach detection and notification procedure

---

## 7. Section 6 — FSSAI & Food Platform Requirements

### 7.1 Current Status

**Zero FSSAI verification exists.** Any person can register as a caterer on PO.PU and list food without providing any food safety credentials.

### 7.2 Legal Position

Under the **Food Safety and Standards Act 2006** and **FSS (Licensing and Registration) Regulations 2011**:
- Every food business operator (FBO) must hold a valid FSSAI license or registration
- Petty food businesses (turnover < ₹12 lakhs/year): FSSAI Registration (State)
- Other food businesses: FSSAI State or Central License
- **Online food delivery platforms** are required to display FSSAI License numbers of listed FBOs under the 2021 FSSAI e-commerce guidelines

### 7.3 Platform Obligations (FSSAI E-Commerce Guidelines 2021)

| Obligation | Status |
|---|---|
| Display FSSAI number on every food listing / caterer page | **Missing** |
| Collect and verify FSSAI license before onboarding caterer | **Missing** |
| Delist caterers with expired licenses | **No mechanism** |
| Display "Veg" / "Non-Veg" symbol (green dot / brown dot) on every food item | **Missing** |
| Allergen information on food listings | **Missing** |
| No listing of unlicensed food businesses | **Not enforced** |

### 7.4 Platform Liability

If a customer suffers food poisoning from a dish ordered via PO.PU from an unlicensed caterer:
- FSSAI can hold the platform liable for "enabling" an unlicensed FBO
- Consumer court claims name the platform as a party
- Criminal liability under FSSA 2006 Section 59 (adulteration / substandard food) can extend to the platform

### 7.5 Required Implementation

**Database:**
```sql
CREATE TABLE fssai_details (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fssai_number     VARCHAR(14) NOT NULL,
  license_type     VARCHAR(20),  -- 'REGISTRATION','STATE_LICENSE','CENTRAL_LICENSE'
  issue_date       DATE,
  expiry_date      DATE NOT NULL,
  certificate_url  TEXT,
  verified         BOOLEAN DEFAULT FALSE,
  verified_by      UUID REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caterer_id)
);
```

**Process:**
1. FSSAI number is mandatory during caterer registration (cannot skip)
2. Admin manually verifies certificate before caterer goes live
3. Automated expiry reminder 60 days, 30 days, and 7 days before expiry
4. Auto-suspension on expiry (with 7-day grace period)
5. FSSAI number displayed on caterer profile and food listing pages

**Food Item Fields (Currently Missing):**
```sql
ALTER TABLE food_items
  ADD COLUMN is_veg        BOOLEAN,         -- NULL = unknown, TRUE = veg, FALSE = non-veg
  ADD COLUMN allergens     TEXT[],           -- array: ['gluten','dairy','nuts',...]
  ADD COLUMN calories      INTEGER,
  ADD COLUMN is_jain       BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_vegan      BOOLEAN DEFAULT FALSE;
```

---

## 8. Section 7 — Rider Compliance

### 8.1 Current Implementation

From the database, riders are linked to caterers via `rider_profiles` (caterer_id foreign key). Riders are not independent — they belong to a specific caterer. The following is stored: `vehicle_type`, `vehicle_number`, `delivery_status`, `current_latitude`, `current_longitude`.

**Zero identity, license, or insurance verification exists.**

### 8.2 Compliance Gaps

| Requirement | Status | Risk |
|---|---|---|
| Government ID (Aadhaar/Voter ID) | Not collected | HIGH |
| Driving License Number + Expiry | Not collected | CRITICAL |
| Driving License Category (LMV/MCWG) | Not collected | CRITICAL |
| Vehicle Registration Certificate (RC) | Not collected | HIGH |
| Vehicle Insurance (Third-Party at minimum) | Not collected | CRITICAL |
| Background verification | Not performed | HIGH |
| Police verification | Not collected | MEDIUM |
| GPS consent for real-time tracking | Not captured | HIGH |
| Rider Agreement acceptance | Not implemented | HIGH |

### 8.3 Legal Classification — Employment vs Contractor

**Current structure:** Riders are employed by Caterers (rider_profiles.caterer_id). Caterers add their own riders.

**Implication:** Riders are workers of the caterer, not of PO.PU. PO.PU's obligation is limited to ensuring the caterers comply with labour laws for their riders.

However, if PO.PU ever moves to a model where it directly assigns riders (through the delivery pool/batch system in migration 037), labour law obligations shift to PO.PU.

The `delivery_tasks`, `delivery_pool`, and `delivery_batches` tables in migration 037 suggest a platform-controlled dispatch system. If PO.PU controls dispatch, sets pay, and sets working hours, riders may be classified as **dependent workers** under the Code on Social Security 2020 — triggering PF, ESI, and gratuity obligations.

### 8.4 Motor Vehicle Liability

If a rider causes an accident during delivery:
- Third-party insurance is the rider's legal obligation (Motor Vehicles Act 1988)
- The platform can be made a party to the suit if it enabled the delivery without verifying insurance
- Minimum viable protection: collect insurance certificate and renewal date

### 8.5 Required Rider Fields

```sql
ALTER TABLE rider_profiles
  ADD COLUMN govt_id_type      VARCHAR(20),   -- 'AADHAAR','VOTER_ID','PASSPORT'
  ADD COLUMN govt_id_number    VARCHAR(30),
  ADD COLUMN govt_id_url       TEXT,
  ADD COLUMN driving_license   VARCHAR(20),
  ADD COLUMN dl_category       VARCHAR(10),
  ADD COLUMN dl_expiry         DATE,
  ADD COLUMN dl_url            TEXT,
  ADD COLUMN vehicle_rc_number VARCHAR(20),
  ADD COLUMN insurance_number  VARCHAR(30),
  ADD COLUMN insurance_expiry  DATE,
  ADD COLUMN insurance_url     TEXT,
  ADD COLUMN background_check_status VARCHAR(20) DEFAULT 'PENDING',
  ADD COLUMN background_check_date   DATE,
  ADD COLUMN gps_consent_given BOOLEAN DEFAULT FALSE,
  ADD COLUMN gps_consent_at    TIMESTAMPTZ;
```

---

## 9. Section 8 — Platform Legal Documents Checklist

| Document | Status | Priority |
|---|---|---|
| **Terms of Service** (Customer) | Not drafted, not shown in app | CRITICAL |
| **Terms of Service** (Caterer / Vendor Agreement) | Not drafted, not shown in app | CRITICAL |
| **Rider Agreement** | Not drafted | HIGH |
| **Privacy Policy** | Not drafted, not shown in app | CRITICAL |
| **Refund & Cancellation Policy** | Not drafted | CRITICAL |
| **Delivery Policy** | Not drafted | HIGH |
| **Self-Pickup Policy** | Not drafted | MEDIUM |
| **Cookie Policy** (Web) | Not drafted | MEDIUM |
| **Grievance Redressal Policy** | Not drafted | CRITICAL |
| **Community Guidelines** | Not drafted | LOW |
| **FSSAI Compliance Policy** (Internal) | Not drafted | HIGH |
| **Data Retention Policy** (Internal) | Not drafted | HIGH |
| **Commission & Settlement Policy** | Not drafted | HIGH (before commission go-live) |

### 9.1 Minimum In-App Requirements

Every page on the app/web must have visible links to:
- Privacy Policy
- Terms of Service
- Refund Policy
- Grievance Contact

The footer in `Footer.jsx` must be updated immediately.

### 9.2 Consent Capture (Registration — All Roles)

During registration, before account creation:
```
[ ] I have read and agree to the Terms of Service
[ ] I have read and agree to the Privacy Policy
[ ] I consent to receive order-related SMS and push notifications
[ ] I agree to share my location for delivery and caterer discovery (optional, can be revoked)
```

These checkboxes must be:
- Non-pre-checked (active consent, not passive)
- Linked to the actual document text
- Timestamped, IP-logged, and stored in `legal_consents` table with document version

---

## 10. Section 9 — Database Changes Required for Compliance

### 10.1 New Tables Required

```sql
-- Legal consent tracking
CREATE TABLE legal_consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type     VARCHAR(50) NOT NULL,
  -- 'TERMS_OF_SERVICE','PRIVACY_POLICY','VENDOR_AGREEMENT','RIDER_AGREEMENT',
  -- 'MARKETING_CONSENT','LOCATION_CONSENT','NOTIFICATION_CONSENT'
  document_version VARCHAR(20) NOT NULL,
  accepted         BOOLEAN NOT NULL,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caterer KYC / compliance
CREATE TABLE caterer_kyc (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pan_number       VARCHAR(10),
  gst_number       VARCHAR(15),
  gst_verified     BOOLEAN DEFAULT FALSE,
  pan_url          TEXT,
  business_type    VARCHAR(30),
  -- 'PROPRIETORSHIP','PARTNERSHIP','LLP','PRIVATE_LIMITED','HUF'
  kyc_status       VARCHAR(20) DEFAULT 'PENDING',
  -- 'PENDING','SUBMITTED','APPROVED','REJECTED'
  kyc_reviewed_by  UUID REFERENCES users(id),
  kyc_reviewed_at  TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Bank account for settlement
CREATE TABLE caterer_bank_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_holder   VARCHAR(200) NOT NULL,
  bank_name        VARCHAR(100) NOT NULL,
  account_number   VARCHAR(30) NOT NULL,
  ifsc_code        VARCHAR(11) NOT NULL,
  account_type     VARCHAR(20) DEFAULT 'SAVINGS',
  is_verified      BOOLEAN DEFAULT FALSE,
  is_primary       BOOLEAN DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- FSSAI licenses
CREATE TABLE fssai_details (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  fssai_number     VARCHAR(14) NOT NULL,
  license_type     VARCHAR(20),
  issue_date       DATE,
  expiry_date      DATE NOT NULL,
  certificate_url  TEXT,
  verified         BOOLEAN DEFAULT FALSE,
  verified_by      UUID REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Grievance tickets
CREATE TABLE grievances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number    VARCHAR(20) UNIQUE NOT NULL,
  user_id          UUID NOT NULL REFERENCES users(id),
  order_ref_id     UUID,
  category         VARCHAR(50) NOT NULL,
  -- 'FOOD_QUALITY','WRONG_ORDER','LATE_DELIVERY','REFUND','PAYMENT','OTHER'
  description      TEXT NOT NULL,
  status           VARCHAR(20) DEFAULT 'OPEN',
  -- 'OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED'
  assigned_to      UUID REFERENCES users(id),
  resolution       TEXT,
  resolved_at      TIMESTAMPTZ,
  escalated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Tax invoices
CREATE TABLE tax_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   VARCHAR(30) UNIQUE NOT NULL,
  invoice_type     VARCHAR(30) NOT NULL,
  party_id         UUID REFERENCES users(id),
  order_ref_id     UUID,
  taxable_amount   NUMERIC(12,2),
  gst_rate         NUMERIC(5,2),
  cgst_amount      NUMERIC(12,2),
  sgst_amount      NUMERIC(12,2),
  igst_amount      NUMERIC(12,2),
  total_amount     NUMERIC(12,2),
  financial_year   VARCHAR(9),
  invoice_date     DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement records
CREATE TABLE settlement_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id),
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  gross_amount     NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tds_deducted     NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_on_commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_payout       NUMERIC(12,2) NOT NULL,
  status           VARCHAR(20) DEFAULT 'PENDING',
  utr_number       VARCHAR(30),  -- Bank UTR for payout
  settled_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- TDS deductions
CREATE TABLE tds_deductions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id       UUID NOT NULL REFERENCES users(id),
  financial_year   VARCHAR(9) NOT NULL,
  quarter          SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  gross_amount     NUMERIC(12,2) NOT NULL,
  tds_rate         NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  tds_amount       NUMERIC(12,2) NOT NULL,
  deducted_at      TIMESTAMPTZ NOT NULL,
  challan_number   VARCHAR(50),
  deposited_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.2 Columns to Add to Existing Tables

```sql
-- users table
ALTER TABLE users
  ADD COLUMN mobile_number   VARCHAR(15),   -- already in some migrations
  ADD COLUMN pan_number      VARCHAR(10),
  ADD COLUMN gst_number      VARCHAR(15),
  ADD COLUMN is_kyc_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN kyc_verified_at TIMESTAMPTZ,
  ADD COLUMN is_deleted      BOOLEAN DEFAULT FALSE,  -- may already exist
  ADD COLUMN deleted_at      TIMESTAMPTZ,
  ADD COLUMN deletion_reason TEXT;

-- food_items table
ALTER TABLE food_items
  ADD COLUMN is_veg          BOOLEAN,
  ADD COLUMN allergens       TEXT[],
  ADD COLUMN calories        INTEGER,
  ADD COLUMN is_vegan        BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_jain         BOOLEAN DEFAULT FALSE;

-- caterer_orders table
ALTER TABLE caterer_orders
  ADD COLUMN settlement_id   UUID REFERENCES settlement_records(id),
  ADD COLUMN settlement_status VARCHAR(20) DEFAULT 'PENDING',
  ADD COLUMN settled_at      TIMESTAMPTZ,
  ADD COLUMN fulfillment_type VARCHAR(20) DEFAULT 'DELIVERY',
  ADD COLUMN pickup_code     VARCHAR(6),
  ADD COLUMN collected_at    TIMESTAMPTZ;

-- payments table
ALTER TABLE payments
  ADD COLUMN gst_amount      NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN invoice_number  VARCHAR(30);
```

---

## 11. Section 10 — Admin Features Required

### 11.1 Missing Admin Screens

| Screen | Purpose | Priority |
|---|---|---|
| **Caterer KYC Verification** | Review and approve/reject caterer documents | CRITICAL |
| **FSSAI Verification** | Review FSSAI certificates, track expiry | CRITICAL |
| **Settlement Dashboard** | Generate and process caterer payouts | CRITICAL |
| **Commission Management** | Set per-caterer or global commission rates | HIGH |
| **Tax Reports** | GSTR-1, GSTR-3B, GSTR-8 data export | HIGH |
| **TDS Management** | Calculate, track, and file TDS per caterer | HIGH |
| **Grievance Management** | Assign, track, and resolve customer complaints | HIGH |
| **Compliance Dashboard** | FSSAI expiry alerts, KYC pending, GST filing status | HIGH |
| **Invoice Management** | View and re-issue tax invoices | MEDIUM |
| **Legal Document Manager** | Update T&C versions, track acceptance | MEDIUM |
| **Rider KYC Verification** | Review rider documents | HIGH |
| **Settlement Reports** | Per-caterer, per-period settlement statements | HIGH |
| **COD Reconciliation** | Match COD orders with cash collection confirmations | HIGH |

---

## 12. Section 11 — Commission Architecture Design

### 12.1 Current Architecture (Good Foundation)

The commission architecture is already well designed:
- `platform_settings` table has `commission_enabled`, `commission_percentage`, `platform_fee_enabled`, `platform_fee_amount`
- `paymentCalculationService.js` reads from DB (not hardcoded), cached 60 seconds
- Commission snapshot stored per `caterer_order` at time of order creation — historical orders are immutable
- Fields: `commission_percentage`, `commission_amount`, `platform_fee`, `caterer_payout`

### 12.2 What Needs to Be Added

| Feature | Current | Required |
|---|---|---|
| Global commission toggle | ✅ Exists | — |
| Per-category commission rate | ❌ Missing | `commission_rules` table |
| Per-caterer commission override | ❌ Missing | `caterer_commission_overrides` table |
| Promotional / zero-commission period | ❌ Missing | Date-range support in commission rules |
| Fixed fee per order | ✅ Exists (`platform_fee`) | — |
| Percentage + fixed fee combined | ✅ Exists | — |
| Settlement workflow | ❌ Missing | `settlement_records` + payout API |
| Commission invoice generation | ❌ Missing | `tax_invoices` + PDF generation |
| TDS deduction on settlement | ❌ Missing | `tds_deductions` table + calculation |

### 12.3 Recommended Commission Rules Table

```sql
CREATE TABLE commission_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name        VARCHAR(100) NOT NULL,
  applies_to       VARCHAR(20) NOT NULL DEFAULT 'ALL',
  -- 'ALL','CATEGORY','CATERER'
  category         VARCHAR(100),  -- food category name
  caterer_id       UUID REFERENCES users(id),
  commission_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  valid_from       DATE NOT NULL,
  valid_to         DATE,          -- NULL = indefinite
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 12.4 Money Flow When Commission Is Live

```
Customer pays ₹500 for order

PhonePe / PA Marketplace Split:
  → PO.PU receives:   ₹50  (10% commission + platform fee)
  → Caterer receives: ₹450 (direct to caterer's PA account)

PO.PU settlement record created:
  gross_amount:       ₹500
  commission_amount:  ₹45  (9% net of 18% GST on commission)
  gst_on_commission:  ₹8.10 (18% GST on ₹45)
  tds_deducted:       ₹5   (1% TDS on ₹500)
  platform_fee:       ₹0
  net_payout:         ₹450 (already paid via PA split)

PO.PU revenue:        ₹45 + GST billing to caterer
TDS deposited:        ₹5 to income tax

Commission invoice issued to caterer (GST-compliant)
TDS certificate (Form 16A) issued annually
```

---

## 13. Section 12 — Risk Analysis

### CRITICAL RISKS (Address before any soft launch)

| # | Risk | Business Impact | Legal Impact | Solution |
|---|---|---|---|---|
| C1 | No settlement mechanism — platform holds customer money with no payout path | Revenue leakage, caterer disputes, operational collapse | RBI PA guidelines violation | Integrate PA marketplace split (Cashfree/Razorpay) |
| C2 | No FSSAI verification — unlicensed food businesses on platform | Food safety incident, regulatory shutdown | FSSAI penalty, criminal liability, FIR | Mandatory FSSAI collection at onboarding |
| C3 | No legal agreements — no T&C, no vendor agreement, no privacy policy | No contract to enforce, no liability protection | CPACT 2019, IT Act, DPDPA violations | Draft and implement all legal documents |
| C4 | GST not collected on food orders (Section 9(5) liability) | Tax demand + penalty for all past orders | CGST Act violation, GST demand + 18% interest | Register as ECO, collect 5% GST on all orders |
| C5 | Manual UPI payment proofs — unregulated payment handling | Fraud losses, customer disputes with no resolution | RBI PA guidelines, Consumer Protection Act | Restrict to gateway payments only |

### HIGH RISKS (Address within 30 days of soft launch)

| # | Risk | Business Impact | Legal Impact | Solution |
|---|---|---|---|---|
| H1 | No rider identity / license / insurance verification | Accident liability, platform reputation | Motor Vehicles Act, Consumer Protection | KYC for all riders |
| H2 | No grievance officer / mechanism | Regulatory action, bad PR | CPACT 2019 Section 35 | Designate officer, build ticket system |
| H3 | No TDS deduction on caterer payments | Income Tax demand | Section 194-O, penalty 1% per month | Implement TDS calculation + Form 26Q |
| H4 | Real-time GPS stored indefinitely | Privacy breach risk | DPDPA 2023, IT Act | Set retention policy, auto-purge |
| H5 | No consent capture at registration | Cannot prove user agreement | DPDPA, IT Act, Consumer Protection | Add consent checkboxes, log to DB |
| H6 | No veg/non-veg marking on food items | Consumer misdirection, religious injury | FSSAI regulations, Consumer Protection | Mandatory veg/non-veg flag per food item |
| H7 | COD has no reconciliation | Cash leakage, rider fraud | Accounting / audit | COD reconciliation reports |

### MEDIUM RISKS (Address within 60 days)

| # | Risk | Solution |
|---|---|---|
| M1 | No allergen information on food items | Add allergen fields, display on UI |
| M2 | Payment screenshots may be fake/fabricated | Move all payments to gateway, deprecate screenshot flow |
| M3 | Caterer can list food without business registration | Collect business type, GST number |
| M4 | No data export for users | Build `/api/profile/export` endpoint |
| M5 | No retention policy for payment data | Define 7-year retention for financial records |
| M6 | App links to no legal documents | Update Footer.jsx with all links |
| M7 | No commission invoice format defined | Define invoice template, invoice numbering |

### LOW RISKS (Address within 90 days)

| # | Risk | Solution |
|---|---|---|
| L1 | No cookie consent banner (web) | Add cookie consent component |
| L2 | Community guidelines not published | Publish in-app |
| L3 | No age gate | Add 18+ confirmation if alcohol is ever added |
| L4 | No accessibility statement | WCAG 2.1 compliance statement |

---

## 14. Section 13 — Recommended Development Roadmap

### Phase 0 — Pre-Soft Launch (Weeks 1–3): Legal Foundations
*Nothing can launch without these*

1. Draft and publish: Terms of Service, Privacy Policy, Refund Policy, Vendor Agreement
2. Add consent checkboxes to RegisterPage.jsx (all roles) and create `legal_consents` table
3. Add FSSAI number field to caterer registration (mandatory)
4. Create `fssai_details` table and admin verification screen
5. Add veg/non-veg flag to every food item (mandatory before listing)
6. Designate a Grievance Officer and publish contact on app
7. Register PO.PU for GST as ECO
8. Consult with RBI-licensed PA (Cashfree Marketplace / Razorpay Route) for marketplace split

### Phase 1 — Compliance Core (Weeks 4–8)
*Required for legal operation*

1. Implement `caterer_kyc` table and admin KYC review screen
2. Implement `caterer_bank_accounts` table
3. Integrate PA Marketplace split payment (remove platform-holds-all-money model)
4. Build basic `settlement_records` workflow (weekly settlement cycle)
5. Implement `grievances` table and in-app grievance submission
6. Implement GST collection (5% on all food orders under Section 9(5))
7. Implement TDS deduction calculation (1% under Section 194-O)
8. Add rider KYC fields (DL, insurance, govt ID)
9. Build admin Compliance Dashboard (FSSAI expiry alerts, KYC pending)

### Phase 2 — Financial Infrastructure (Weeks 9–16)
*Required before enabling commission*

1. Build `tax_invoices` table and PDF invoice generation
2. Build commission invoice flow (caterer gets commission invoice per settlement)
3. Build customer receipt generation (order receipt email with tax breakdown)
4. Build GSTR-1 / GSTR-3B / GSTR-8 data export for admin
5. Build `tds_deductions` tracking and Form 16A generation
6. Build `commission_rules` table with per-category and per-caterer overrides
7. Build Settlement Dashboard in admin panel
8. Enable commission (start at 2–5%, ramp up)

### Phase 3 — Scale & Full Compliance (Weeks 17–24)
*Required for Play Store / serious scale*

1. DPDPA compliance: data export, account anonymisation, breach procedure
2. GPS data retention policy and auto-purge scheduler
3. Full accounting integration (Tally / Zoho Books API)
4. FSSAI expiry auto-suspension with grace period
5. COD reconciliation reports
6. Rider insurance expiry tracking
7. Annual TDS return data generation

---

## 15. Go-Live Checklist

### Legal (All must be ✅ before launch)
- [ ] Terms of Service drafted and approved by lawyer
- [ ] Privacy Policy drafted and DPDPA-compliant
- [ ] Vendor (Caterer) Agreement drafted and approved
- [ ] Refund & Cancellation Policy published
- [ ] Grievance Officer designated (name + email + phone published in app)
- [ ] All policies linked from app footer and registration screen
- [ ] Consent checkboxes implemented at registration (non-pre-checked)
- [ ] Consent records being saved to `legal_consents` table

### Financial
- [ ] GST registration obtained (ECO status)
- [ ] PA Marketplace integration OR 0% commission confirmed with legal sign-off
- [ ] Settlement workflow implemented (even if manual at launch)
- [ ] COD reconciliation process defined

### Caterer Onboarding
- [ ] FSSAI number mandatory at registration
- [ ] Admin FSSAI verification screen live
- [ ] Veg/non-veg flag mandatory on all food items
- [ ] Caterer has accepted Vendor Agreement (with timestamp logged)

### Consumer Protection
- [ ] Order confirmation email implemented
- [ ] Refund SLA communicated to customer (e.g., "refunds within 5–7 business days")
- [ ] Grievance ticket submission available in app
- [ ] Caterer FSSAI number displayed on caterer profile and listing

### Rider
- [ ] Driving licence field collected at rider registration
- [ ] Insurance expiry field collected
- [ ] GPS consent captured and logged

### Security
- [ ] JWT_SECRET rotated from default (check docker-compose.yml — default is `popu_jwt_super_secret_change_in_production`)
- [ ] Database passwords rotated from docker-compose defaults
- [ ] All API keys restricted (Google Maps HTTP referrer, PhonePe to production)
- [ ] HTTPS enforced on all endpoints (Render provides this)

---

## 16. Production Readiness Score

| Category | Score | Max | Notes |
|---|---|---|---|
| Payment Architecture | 35 | 100 | PhonePe technically correct; no settlement mechanism |
| Legal Documents | 0 | 100 | Nothing exists |
| GST / Tax | 0 | 100 | No implementation anywhere |
| Consumer Protection | 10 | 100 | No consent, no grievance, no refund policy |
| FSSAI / Food Safety | 0 | 100 | Not implemented |
| Data Privacy | 15 | 100 | Data is secured but no consent or DPDPA compliance |
| Rider Compliance | 5 | 100 | Fields exist, no verification |
| Caterer KYC | 5 | 100 | UPI ID collected; no PAN, GST, FSSAI |
| Security (Technical) | 70 | 100 | JWT, bcrypt, helmet, rate-limiting — solid |
| Commission Architecture | 60 | 100 | Fields and calculation exist; settlement missing |
| **TOTAL** | **200** | **1000** | **20% — Pre-launch only** |

---

*This report is based on direct analysis of the PO.PU source code, database schema (37 migrations), payment service implementation, and applicable Indian law as of June 2026. It does not constitute legal advice. Engage qualified legal counsel for final document drafting, GST registration, and RBI PA assessment.*
