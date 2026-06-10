# CarbonIQ Architecture & Implementation Document

## 1. System Architecture Explanation
CarbonIQ is designed as a modular, scalable SaaS platform using a layered architecture pattern to ensure separation of concerns and maintainability.

### Module Breakdown
- **/app**: Contains all Next.js App Router definitions. UI components here are strictly presentation-focused and only call `/services` or `/lib` for logic.
- **/lib/carbon-engine**: A library of pure, deterministic functions that calculate CO2 footprints. This ensures testability and prevents UI entanglement.
- **/lib/security**: Centralized security utilities for JWT generation/verification, password hashing, and rate-limiting logic.
- **/lib/validators**: Zod schemas for all incoming data validation, acting as the primary anti-corruption layer.
- **/services**: The bridge between API routes/UI and the database/external APIs. Contains `carbonService` (caching, DB calls) and `aiService` (AI interaction, response caching).
- **/components**: Reusable UI elements built with TailwindCSS, adhering to WCAG standards.

## 2. Security Strategy
Security is embedded at every layer, treating all user input as untrusted.

- **Authentication**: JWT-based session management using `httpOnly`, `Secure`, and `SameSite=Strict` cookies. This mitigates XSS attacks from stealing tokens.
- **Data Validation**: Strict runtime validation of all API payloads and form inputs using `Zod`. No unvalidated data reaches the database or core engine.
- **Route Protection**: Next.js Middleware intercepts requests to protect private routes and validate JWTs before rendering.
- **Rate Limiting**: Implementation of API rate limiting to prevent brute-force attacks and abuse of the AI Coach endpoints.
- **Data Protection**: Passwords hashed using `bcrypt`. All DB interactions use Prisma (an ORM) to naturally prevent SQL injection.

## 3. Performance Optimization Strategy
CarbonIQ prioritizes low latency and minimal redundant processing.

- **Calculation Caching**: Carbon footprint results are cached per user for identical inputs.
- **AI Response Caching**: AI Coach suggestions are aggressively cached based on footprint signatures to reduce external API costs and latency.
- **Frontend Debouncing**: Forms utilizing real-time calculations or API checks are debounced (e.g., using `useDebounce` hook) to prevent excessive network requests.
- **Database Optimization**: Prisma schema includes indexes on frequently queried fields (e.g., `userId` on footprints).

## 4. Testing Strategy
The testing suite is built on Jest, focusing heavily on core logic and critical paths.

- **Unit Tests (Core Engine)**: Extensive tests on `/lib/carbon-engine` covering standard inputs, zero values, negative numbers (error handling), and exceptionally large inputs.
- **Auth & Validation Tests**: Unit tests for Zod schemas to ensure malformed data is rejected. Tests for `bcrypt` and JWT utility wrappers.
- **Service Integration Tests**: Tests verifying that services correctly interact with caching mechanisms and gracefully handle database operations.

## 5. Accessibility Compliance Mapping
CarbonIQ is built to be WCAG compliant, ensuring usability for all users.

- **Keyboard Navigation**: All interactive elements (forms, buttons, links) are reachable and operable via keyboard (`tabIndex`, proper semantic HTML).
- **Screen Reader Support**: Use of `aria-labels`, `aria-describedby`, and roles where semantic HTML is insufficient.
- **Visual Accessibility**: TailwindCSS utility classes enforce a high-contrast color palette. Focus states are prominent and not `outline-none` without a replacement.
- **Structure**: A `skip-to-content` link is included in the root layout to allow users to bypass navigation. Logical heading hierarchy (`h1`, `h2`, etc.) is strictly enforced.
