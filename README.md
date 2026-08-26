# Enterprise Order Suite (EOS) - Frontend

Modern React + TypeScript client application for the Enterprise Order Suite, a B2B Order Management System. This frontend provides a responsive, role-aware dashboard for order fulfillment, inventory management, user profiles, and a Kitchen Display System (KDS). 

Designed as the client-side counterpart to a Spring Boot/PostgreSQL backend, this repository prioritizes clean architecture, type-safe API consumption, strict separation of concerns, and scalable state management.

## 🎯 Overview
The EOS frontend is a modular Single Page Application (SPA) built to handle the operational complexities of B2B transactions and restaurant/kitchen management. It consumes a secure REST API to manage the entire order lifecycle, from product cataloging to kitchen preparation and final delivery workflows.

## ⚡ Technical Snapshot

| Area | Implementation |
| :--- | :--- |
| **Framework** | React 19] |
| **Language** | TypeScript (Strict / verbatimModuleSyntax) |
| **Build Tool** | Vite |
| **Routing** | React Router v7 |
| **API Client** | Axios |
| **State Management** | TanStack Query (React Query) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | ShadCN/UI, lucide-react |

## 🖥️ Application Preview

*(Placeholder: Add Dashboard Screenshot)*
*(Placeholder: Add Orders Workflow Screenshot)*
*(Placeholder: Add KDS Dashboard Screenshot)*
*(Placeholder: Add Authentication/Login Screenshot)*

## 🏗️ System Architecture

The frontend integrates directly with the EOS backend, acting as the presentation and client-state layer while relying on the backend for transactional integrity and authorization enforcement.

flowchart LR
    User -->|Interacts| Frontend(React + TypeScript UI)
    Frontend -->|REST / JSON + JWT| Backend(Spring Boot 3)
    Backend --> PostgreSQL[(PostgreSQL)]
    Backend --> MinIO[(MinIO Object Storage)]

### Full-Stack Responsibilities

* **Frontend:** Handles presentation, client-side data validation, protected routing boundaries, API consumption, and localized UI state.


* **Backend:** Fully authoritative for authentication, RBAC enforcement, business rule validation, financial calculations, object storage, and transactional persistence.



## 🖥️ Application Features

* **Order Operations:** Real-time data grids with inline workflow editing, contextual row actions, and slide-out detail drawers for complex nested products.


* **Kitchen Display System (KDS):** Interactive, high-contrast station boards with timers and real-time ticket management.


* **Menu & Catalog:** High-density inventory matrix featuring stock indicators, SKU management, and pricing.


* **White-Label Preferences:** Dynamic storefront configuration, brand color picking, and business status toggling.


* **Role-Aware Navigation:** UI gracefully adapts to `SUPER_ADMIN`, `ADMIN`, and `USER` payloads.



## 🧩 Component Architecture

The codebase strictly adheres to a **Vertical Slice Architecture (VSA)**. Rather than organizing files by technical type (e.g., all hooks together, all components together), the application is isolated by business domain:


src/features/orders/
 ├── components/    # Feature-specific UI orchestrators and components
 ├── hooks/         # TanStack Query server-state management
 ├── services/      # Axios API integration
 ├── constants/     # Static data, configuration, schemas
 └── index.ts       # Clean barrel exports

Page components (`src/pages/`) act purely as thin routing shells that manage structural layouts and inject the feature orchestrators.

## 🔌 API Integration & State

* **Axios Integration:** A centralized Axios client (`@/api/client`) handles network requests, preventing request logic from leaking into individual components.


* **TanStack Query:** Server state is completely decoupled from UI state. Custom hooks (e.g., `useOrders`) manage caching, loading flags, and error states, eliminating standard `useEffect` data-fetching boilerplate.


* **Type Safety:** All API requests and responses utilize strictly typed interfaces defined in `src/types/` to ensure contract alignment with the Spring Boot backend.



## 🔐 Authentication & Security

* **JWT Handling:** Authentication endpoints issue secure tokens for the client to interact with the backend API.


* **Layout Boundaries:** Routing utilizes a declarative "Y-Split" architecture. Authenticated paths are wrapped in a `<ProtectedLayout />` component that acts as a security gate, intercepting unauthenticated users before the main `<AppLayout />` can mount.



## 📝 Forms & Validation

Form components handle their own local state and utilize client-side validation prior to mutation. Upon catching Axios errors from the API, TanStack mutations surface backend error messages directly into the UI, ensuring smooth user feedback loops.

## 🧠 Engineering Decisions & Challenges

**Decision:** Adopt a Vertical Slice Architecture over a traditional monolithic file structure.

* **Reason:** Initial iterations of complex views (like Orders and Analytics) heavily coupled API calls, data formatting, and raw HTML inside single massive files, causing fragility.


* **Result:** Feature orchestrators now purely compose ShadCN/UI primitives, while data fetching is abstracted to hooks and network calls to services. This enables high developer velocity and testability.



**Decision:** Implement a declarative layout boundary (`ProtectedLayout`).

* **Reason:** The application required a B2B admin dashboard (with sidebars and metrics) alongside a completely distinct B2C customer storefront.


* **Result:** Utilizing `react-router` layout boundaries prevents layout collisions and ensures unauthenticated users cannot visually mount the admin shell.



**Decision:** Abstract KDS State through TanStack Query Hooks.

* **Reason:** The Kitchen Display System (KDS) required rapid updates (marking tickets as prepared) where waiting for an API round-trip would feel sluggish to kitchen staff in a high-stress environment.


* **Result:** Abstracted KDS state into dedicated TanStack Query hooks, paving the way for immediate visual UI feedback and robust real-time synchronization.



## 🚀 Running Locally

### Requirements

* Node.js (v18+)
* Yarn package manager


* Git
* EOS Spring Boot Backend running locally on `localhost:8080`


### Installation

git clone <repository-url>
cd enterprise-order-suite-frontend
yarn install

### Environment Variables

Create a `.env` file in the root directory:


VITE_API_URL=http://localhost:8080/api


### Development

yarn dev


### Production Build

yarn build
yarn preview


## 💼 What This Project Demonstrates

* **Software Architecture:** Refactoring from monolithic prototypes to production-grade Vertical Slice Architecture.


* **Full-Stack Context:** Understanding where client responsibility ends and server authority begins.


* **API Consumption:** Type-safe REST communication bridging React and Spring Boot.


* **Modern React:** Proficient use of TanStack Query, React Router v7, and compositional UI patterns.


* **Problem Solving:** Creating distinct layout routing boundaries to support multi-tenant/multi-role business requirements.



## 🔮 Future Improvements

* Still being worked and and improvement plan + requirements is yet to be created
