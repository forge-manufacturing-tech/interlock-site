# Interlock Frontend - AI Agent Guide

## Project Context
This is the frontend for **Interlock**, a manufacturing/SaaS application with a distinct **"Industrial" design aesthetic** (dark metals, copper accents, scanning lines, technical fonts).

## Technology Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom CSS (`index.css`) for the industrial look.
- **Testing**: Cypress (E2E/Integration)

## ⚠️ CRITICAL INSTRUCTIONS FOR AGENTS

### 1. ALWAYS Run Tests Before Committing
You **MUST** verify that all integration tests pass before confirming a task is complete or suggesting a code commit. The tests ensure the critical authentication and project management flows work.

**How to run tests:**
1.  **Ensure the Dev Server is Running**:
    The tests run against the local development server. You generally need to have `npm run dev` running in a background process.
    *   Check if it's running. If not, start it: `npm run dev &` (or use a tool to start it in the background).
2.  **Run Cypress**:
    ```bash
    npm run test
    ```
    *   If the server is not running at `http://localhost:3000`, Cypress will fail.

### 2. Maintain the Design Aesthetic
- **Do NOT** revert to standard/generic UI components.
- **Preserve** the unique "Industrial" classes:
    - `.industrial-panel`
    - `.industrial-btn`
    - `.industrial-headline`
    - `.metal-texture`
    - `.scanlines`
- **Colors**: Use the custom `industrial-*` colors defined in Tailwind config (steel, copper, concrete, alert).

### 3. File Structure
- `src/api/generated`: Generated API client (do not edit manually unless necessary, prefer regeneration).
- `src/pages`: Main page components.
- `src/components`: Reusable UI components.
- `cypress/e2e`: Test definitions. **Update these if you change user-facing text or flows.**

## Common Issues
- **Cypress connection failed**: Check that `npm run dev` is actually listening on port 3000.
- **Lint errors**: Check `npm run lint` if available, or rely on IDE feedback.
