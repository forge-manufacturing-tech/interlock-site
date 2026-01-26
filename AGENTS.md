# Agent Code of Conduct & Workflow

This document outlines the rules and workflows for any AI agent working on the `interlock-site` repository.

## 🛑 MANDATORY: Testing Protocol

**Rule #1**: never break the build.
**Rule #2**: NEVER break the tests.

Before you mark a task as "Complete" or submit code changes:
1.  **Verify the Application**: Ensure the code builds and runs.
2.  **Run Integration Tests**:
    *   Command: `npm run test`
    *   **Prerequisite**: The dev server (`npm run dev`) must be running on `http://localhost:3000`.
    *   If you modify UI text or flows, you **MUST** update the corresponding Cypress tests in `cypress/e2e/`.

### Troubleshooting Tests
- If tests fail with "Connection Refused": Start the dev server!
- If tests fail due to timeout: The backend might be slow or down, or the element isn't appearing.
- If you changed the UI (e.g., "Sign In" -> "System Access"): Update the text assertions in the spec files immediately.

## 🎨 Design Systems
This project uses a strict "Industrial/Sci-Fi" aesthetic.
- **Do not** introduce "clean corporate" or "Material Design" styles unless requested.
- **Do** use the custom CSS classes found in `src/index.css`.
- **Do** keep the interface feeling "heavy", "mechanical", and "premium".

## 📂 Key Directories
- `src/`: Application source.
- `cypress/`: End-to-end tests.
- `.github/workflows/`: CI automation (Runs Cypress on PR).

## 🚀 Deployment
- Deployments are handled via GitHub Actions.
- Ensure the `cypress.yml` workflow passes on your branch.
