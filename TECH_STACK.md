# PO.PU — Technology Stack & Third-Party Services Declaration

**Document Type:** Technology Stack Disclosure  
**Application Name:** PO.PU (Pure · Fresh · Trusted)  
**Application Type:** Multi-sided food-delivery marketplace  
**Android Package:** `com.popu.app`  
**Document Date:** June 2026  
**Prepared by:** Engineering Team

---

## 1. Application Overview

PO.PU is a food-delivery and home-catering marketplace connecting Customers, Caterers (home chefs and cloud kitchens), Delivery Riders, and Administrators. The platform operates across three surfaces:

| Surface | Technology | Distribution |
|---|---|---|
| Web Application | React (browser) | Vercel CDN |
| Android Application | Capacitor WebView (APK / Play Store) | Google Play Store |
| Admin Panel | React (browser, same codebase) | Vercel CDN |

---

## 2. Frontend — Web & Android Application

### 2.1 Core Framework

| Component | Technology | Version | License |
|---|---|---|---|
| UI Framework | React | 19.1.0 | MIT |
| Build Tool | Vite | 7.0.0 | MIT |
| Language | JavaScript (JSX) | ES2022+ | — |
| Routing | React Router DOM | 7.17.0 | MIT |
| Server State | TanStack React Query | 5.80.7 | MIT |
| HTTP Client | Axios | 1.10.0 | MIT |

### 2.2 UI Component Library

| Component | Technology | Version | License |
|---|---|---|---|
| Component Library | MUI (Material UI) | 7.1.0 | MIT |
| Icon Library | MUI Icons Material | 7.1.0 | MIT |
| Styling Engine | Emotion (React + Styled) | 11.14.0 | MIT |

### 2.3 Android Mobile Wrapper

| Component | Technology | Version | License |
|---|---|---|---|
| Mobile Runtime | Capacitor | 6.2.1 | MIT |
| Android Bridge | @capacitor/android | 6.2.1 | MIT |
| Geolocation | @capacitor/geolocation | 6.1.1 | MIT |
| Push Notifications | @capacitor/push-notifications | 6.0.5 | MIT |
| Camera | @capacitor/camera | 6.1.3 | MIT |
| Splash Screen | @capacitor/splash-screen | 6.0.4 | MIT |
| Status Bar | @capacitor/status-bar | 6.0.3 | MIT |
| App Lifecycle | @capacitor/app | 6.0.3 | MIT |

### 2.4 Mapping

| Component | Technology | License |
|---|---|---|
| Maps JavaScript API | Google Maps JavaScript API (via `@googlemaps/js-api-loader` 2.1.1) | Google Maps Platform Terms of Service |
| Geocoding | Google Geocoding API | Google Maps Platform Terms of Service |
| Place Search | Google Places API | Google Maps Platform Terms of Service |

---

## 3. Backend — API Server

### 3.1 Runtime & Framework

| Component | Technology | Version | License |
|---|---|---|---|
| Runtime | Node.js | 20 (LTS) | MIT |
| Web Framework | Express | 5.1.0 | MIT |
| Container | Docker (Alpine Linux base) | — | Apache 2.0 / MIT |

### 3.2 Database

| Component | Technology | Version | License |
|---|---|---|---|
| Primary Database | PostgreSQL | 16 | PostgreSQL License (MIT-like) |
| DB Client | node-postgres (pg) | 8.16.2 | MIT |
| UUID Generation | pgcrypto extension | Built-in | PostgreSQL License |
| Full-text Search | pg_trgm extension | Built-in | PostgreSQL License |

#### Database Schema — Tables

The application uses the following relational tables:

| Category | Tables |
|---|---|
| Users & Auth | `users`, `otp_verifications`, `password_reset_tokens`, `user_addresses`, `user_payment_methods`, `user_mobile_audit` |
| Food Catalogue | `food_items`, `food_events`, `customer_favorites` |
| Orders | `master_orders`, `caterer_orders`, `caterer_order_items`, `orders`, `order_items`, `order_status_history`, `cart_items` |
| Tiffin (Subscription) | `tiffin_box_settings`, `tiffin_food_mapping`, `tiffin_orders`, `tiffin_order_days`, `tiffin_order_items` |
| Catering (Events) | `catering_services`, `catering_bookings` |
| Delivery Engine | `rider_profiles`, `rider_locations`, `delivery_batches`, `delivery_batch_tasks`, `delivery_tasks`, `delivery_pool`, `delivery_settings` |
| Payments | `payments`, `payment_proofs`, `refunds` |
| Notifications | `notifications`, `system_notifications` |
| Platform | `platform_settings`, `service_config`, `reviews`, `audit_logs`, `email_logs` |

### 3.3 Security & Middleware

| Component | Library | Version | Purpose |
|---|---|---|---|
| Authentication | jsonwebtoken (JWT) | 9.0.2 | Stateless auth tokens (7-day expiry) |
| Password Hashing | bcrypt | 6.0.0 | Argon/BCrypt password storage |
| Security Headers | helmet | 8.1.0 | HTTP security headers (CSP, HSTS, etc.) |
| Rate Limiting | express-rate-limit | 8.5.2 | API abuse prevention |
| Input Validation | express-validator | 7.2.1 | Request sanitisation and validation |
| CORS | cors | 2.8.5 | Cross-origin request control |
| HTTP Logging | morgan | 1.10.0 | Access log (combined format in production) |
| Environment Config | dotenv | 16.5.0 | Runtime environment variable management |

### 3.4 Background Schedulers (Server-side)

| Scheduler | Purpose |
|---|---|
| `orderEscalationScheduler` | Auto-cancel orders not accepted within configured timeout |
| `deliveryScheduler` | Poll and assign delivery tasks to available riders |

---

## 4. Third-Party Services & APIs

### 4.1 Payment Gateways

The application integrates with the following payment providers. The active provider is configurable at runtime via the Admin Panel.

| Provider | Purpose | Integration Type |
|---|---|---|
| **PhonePe** (Primary) | UPI, credit/debit card, net banking | Server-to-server REST API (Standard Checkout v2) |
| **Cashfree** | Alternative payment gateway | Server-to-server REST API |
| **Razorpay** | Alternative payment gateway | Server-to-server REST API |
| **Manual UPI** | Direct UPI QR code payment | In-app flow (no gateway SDK) |
| **Cash on Delivery (COD)** | Cash payment at delivery | No external integration |

All payment webhooks are verified server-side before order state is updated.

### 4.2 Communication Services

| Service | Provider | Purpose | Library |
|---|---|---|---|
| Transactional Email | SMTP (configurable host) | Order confirmations, password reset, OTP | Nodemailer 9.0.1 |
| WhatsApp Notifications | **Twilio** (WhatsApp Business API) | Order status updates to customers | Node.js built-in `https` |
| Push Notifications | **Firebase Cloud Messaging (FCM)** | In-app push notifications (Android) | @capacitor/push-notifications + google-services.json |

### 4.3 Google Platform Services

| Service | SDK / API Used | Purpose |
|---|---|---|
| Google Maps JavaScript API | `@googlemaps/js-api-loader` 2.1.1 | Interactive map, address picker |
| Google Geocoding API | Google Maps Platform | Reverse geocoding (coordinates → address) |
| Google Places API | Google Maps Platform | Address autocomplete / search |
| Firebase Cloud Messaging | Firebase Android SDK (via `google-services.json`) | Push notification delivery |

**Google Cloud Project:** Used under Google Maps Platform Terms of Service.  
**Android Package:** `com.popu.app`  

### 4.4 Hosting & Infrastructure

| Component | Provider | Service Used |
|---|---|---|
| Backend API | **Render** | Managed web service (Node.js) |
| Frontend / Web App | **Vercel** | Static site / CDN |
| Database | **Render** (or self-hosted) | Managed PostgreSQL 16 |
| Container Registry | Docker Hub / Render | Docker image build and deploy |
| Android Builds | Local Gradle / **Expo EAS** (React Native variant) | APK & AAB generation |

### 4.5 Version Control & Development

| Tool | Service | Purpose |
|---|---|---|
| Source Control | **GitHub** | Code repository, branch-based workflow |
| Build System | **Gradle** (Android) | Android APK / AAB compilation |
| Java Runtime | OpenJDK 17 | Android build toolchain |
| Android SDK | Android SDK 34 | Target SDK for Play Store |

---

## 5. Mobile Application Details

### 5.1 Capacitor Android (Primary)

The primary Android application is built using **Ionic Capacitor**, which wraps the React web application in an Android WebView and provides native device API bridges.

| Property | Value |
|---|---|
| Application ID | `com.popu.app` |
| Min SDK Version | Android 5.1 (API 22) |
| Target SDK Version | Android 14 (API 34) |
| Compile SDK Version | 34 |
| WebView Scheme | `https://app.popu.in` |
| Build Tool | Gradle 8.2.1 with AGP |
| Java Version | Java 17 (OpenJDK) |
| Signing | Custom release keystore (`popu-release.keystore`) |

**Android Permissions Declared:**

| Permission | Reason |
|---|---|
| `INTERNET` | All API and map requests |
| `ACCESS_NETWORK_STATE` | Network availability checks |
| `ACCESS_FINE_LOCATION` | Precise GPS for delivery and address detection |
| `ACCESS_COARSE_LOCATION` | Fallback location |
| `ACCESS_BACKGROUND_LOCATION` | Rider GPS tracking while app is minimised |
| `FOREGROUND_SERVICE` | Rider location foreground service |
| `FOREGROUND_SERVICE_LOCATION` | Location-type foreground service declaration |
| `CAMERA` | Food photo upload by caterers |
| `READ_MEDIA_IMAGES` | Gallery access (Android 13+) |
| `READ_EXTERNAL_STORAGE` | Gallery access (Android ≤ 12) |
| `POST_NOTIFICATIONS` | Push notification delivery |
| `RECEIVE_BOOT_COMPLETED` | Restart services after device reboot |
| `VIBRATE` | Notification vibration |

### 5.2 React Native App (Secondary / Prototype)

A separate React Native application exists in the `mobile-app/` directory, built with **Expo SDK 51**. It uses:

| Component | Technology |
|---|---|
| Framework | React Native 0.74.0 + Expo 51 |
| Navigation | React Navigation 6 |
| Maps | react-native-maps 1.14.0 |
| Location | expo-location |
| Notifications | expo-notifications |
| Storage | expo-secure-store, AsyncStorage |
| Build | Expo EAS Build |

---

## 6. Open-Source Licences Summary

All primary dependencies are released under permissive open-source licences:

| Licence | Key Libraries |
|---|---|
| **MIT** | React, Vite, Express, Node.js, MUI, Capacitor, JWT, Axios, React Router, TanStack Query, Nodemailer, Helmet, Bcrypt, CORS, pg, dotenv, Expo, React Native |
| **PostgreSQL Licence** (MIT-like) | PostgreSQL 16 |
| **Apache 2.0** | Docker base images, some Expo modules |

No GPL, LGPL, or copyleft licences are used in the production application.

---

## 7. Data Handling Summary

| Data Category | Storage | Notes |
|---|---|---|
| User credentials | PostgreSQL (`users` table) | Passwords stored as bcrypt hash only — never plaintext |
| JWT tokens | Client-side (localStorage / SecureStore) | Server is stateless; tokens expire in 7 days |
| Location coordinates | PostgreSQL (`users`, `rider_locations` tables) | Used for delivery matching and map display |
| Payment references | PostgreSQL (`payments`, `payment_proofs` tables) | Transaction IDs only; no card/UPI data stored on our servers |
| Push notification tokens | PostgreSQL | Device FCM tokens for notification delivery |
| OTP codes | PostgreSQL (`otp_verifications` table) | Short-lived; deleted after verification |
| Audit logs | PostgreSQL (`audit_logs`, `user_mobile_audit`, `email_logs`) | Retained for compliance and dispute resolution |

---

## 8. Summary of External Agreements Required

The following third-party platforms are integrated and require active commercial or developer agreements:

| Platform | Agreement Type |
|---|---|
| Google Maps Platform | Google Maps Platform Terms of Service + billing account |
| Firebase (Google) | Google Firebase Terms of Service |
| PhonePe | PhonePe Payment Gateway Merchant Agreement |
| Cashfree | Cashfree Payments Merchant Agreement |
| Razorpay | Razorpay Merchant Agreement |
| Twilio | Twilio Master Services Agreement (WhatsApp Business API) |
| Render | Render Cloud Services Agreement |
| Vercel | Vercel Terms of Service |
| GitHub | GitHub Terms of Service |
| Google Play Store | Google Play Developer Distribution Agreement |
| Expo (EAS) | Expo Terms of Service (if using EAS Build for React Native) |

---

*This document reflects the technology stack as of June 2026. It should be updated whenever new third-party services are added or existing ones are replaced.*
