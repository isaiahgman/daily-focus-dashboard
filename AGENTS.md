# Project Context: Godly Encouragement

This file contains **global, repository-wide** rules and guidelines that apply to all AI agents working on this project. Please read this to understand the codebase architecture and developer workflows before proposing changes.

## Core Architecture
Godly Encouragement is a serverless, statically deployed React application that serves daily scripture, AI-generated takeaways, historical context, and commentary.

The project is structured as follows:
* **Frontend**: Built using React, Vite, TypeScript, Tailwind CSS, and Radix UI components (cards, buttons, etc.).
* **Data Layer (`src/data/data.json`)**: Serves as the static database for the app. The React client imports this file directly, allowing instantaneous loads without network loading states.
* **Daily Focus Aggregator (`scripts/fetchData.js`)**: A Node.js script executed daily by GitHub Actions. It:
  1. Fetches a random verse from `bible-api.com`.
  2. Uses the Google GenAI SDK (`gemini-2.5-flash`) to generate 3 concise, modern, and highly actionable takeaways.
  3. Falls back to a localized raw mode using `src/data/fallback_data.json` if APIs or keys fail.
  4. Overwrites `src/data/data.json` with the updated payload.
* **Workflows (`.github/workflows/`)**:
  * `ci.yml`: Lints and builds the codebase on every pull request or push to `main`.
  * `daily-deploy.yml`: Triggers daily at 6:00 AM UTC (or manually). It runs the data aggregation script, builds the static bundle via Vite, and deploys it to GitHub Pages.

## Development Standards
- **Strict TypeScript**: No implicit `any`, explicit types required for exports.
- **Git Flow**: Strict pre-commit checks using Husky and `lint-staged`.
- **Local Pre-flight Checks**: Before staging, committing, or pushing code, you MUST run `npm run lint` and `npm run build` locally to verify correctness.

## GitHub Pull Request Workflow & Branching
- **Branching Policy**: For every new request, feature, bug, or design thought, a new branch MUST be created from `main`. Address the issue on that branch and create a separate Pull Request, rather than combining unrelated changes into a single branch or PR.
  - **Branch Naming**: Branch names should be a very short, concise phrase covering what the branch and PR is doing. All lower case, separated by hyphens (e.g., `clean-project-context`).
  - **Commit Messages**: Commit messages should be very short, concise phrases as well. All lower case, no punctuation (e.g., `clean project context`).
- **Branch Protection & Merging Rules**:
  - The `main` branch is strictly protected. Direct pushes to `main` are prohibited.
  - Pull Requests MUST NOT be merged unless all status checks (ESLint, build, and typecheck) have passed.
- **Pull Request Description Formatting**: All Pull Request descriptions in this repository MUST be formatted exactly with the following two main headers and structure:
  - `## Summary`: A brief overview of what this PR accomplishes.
  - `## Changes`: A bulleted list detailing specific modifications.
  - Do not use other heading hierarchies or alternative names for these sections.
- **Agent specific workflow**:
  - **Always check PR status**: Agents MUST check if an existing Pull Request is already merged (e.g. using `gh pr view <number>`) before pushing new commits or updating descriptions. 
  - If the PR is merged, the agent MUST fetch origin main, create a new branch from `main`, and open a new Pull Request. Do not push to or update dead, merged PRs.
