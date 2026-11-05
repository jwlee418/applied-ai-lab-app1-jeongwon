# Application Architecture

The Regional Sales Revenue & AI Shift Analyzer is an executive financial intelligence application that allows business leaders and revenue operations teams to upload multi-quarter sales order CSV datasets, automatically sanitize inconsistent regional naming and formatting, cross-tabulate regional revenue trends, and generate strict, hallucination-free executive summaries of quarterly revenue shifts using Google Gemini AI grounded exclusively in deterministic calculations.

| File | Purpose |
| :--- | :--- |
| `/.env.example` | Provides a template defining the required environment variables, specifically the Google Gemini API key and application server port. |
| `/.gitignore` | Specifies files and directories that Git version control should ignore, such as build outputs and local environment files. |
| `/ARCHITECTURE.md` | Documents the application purpose and file directory for business stakeholders and technical auditors. |
| `/bun.lock` | Records locked dependency versions from the original package bundle. |
| `/index.html` | Serves as the web entry point containing the page structure, browser metadata, and SEO configuration for the user interface. |
| `/metadata.json` | Defines the platform metadata, application permissions, and declared AI capabilities within Google AI Studio. |
| `/package.json` | Manages the application manifest, script commands for building and running the project, and third-party software dependencies. |
| `/server.ts` | Powers the Node.js Express backend server that serves the web application, exposes health checks, and securely requests Gemini AI summaries using validated calculations. |
| `/src/App.tsx` | Coordinates the primary dashboard user interface, managing state for uploaded datasets, active filters, hygiene toggles, and metric calculations. |
| `/src/components/AiSummaryCard.tsx` | Displays the executive three-sentence AI summary of the top-shifting region alongside variance metric badges and regeneration controls. |
| `/src/components/CsvUploader.tsx` | Provides a drag-and-drop modal and file picker enabling users to upload custom sales order CSV files or preview requirements. |
| `/src/components/DataHygieneModal.tsx` | Presents an audit log modal showing every automatic data correction, whitespace trim, and regional name consolidation made to the dataset. |
| `/src/components/Header.tsx` | Renders the top navigation banner with dataset summary statistics, sample data loaders, template downloads, and action triggers. |
| `/src/components/RawDataDrawer.tsx` | Provides a tabular drawer for searching, filtering, and inspecting individual cleaned sales transactions. |
| `/src/components/RegionalDeepDive.tsx` | Analyzes the underlying drivers of a selected region's performance, breaking down variance by product line, sales channel, order volume, and discount rates. |
| `/src/components/RevenueChart.tsx` | Visualizes quarterly regional revenue trends using responsive SVG bar charts, variance indicators, and metric callouts. |
| `/src/components/RevenueTable.tsx` | Displays an interactive cross-tabulation matrix of revenues across quarters (Q1 through Q4) with calculated Q2-to-Q3 dollar and percentage changes. |
| `/src/index.css` | Sets up global styling rules and Tailwind CSS directives for the application layout and responsive design. |
| `/src/main.tsx` | Mounts the React application into the browser DOM entry point. |
| `/src/types.ts` | Defines TypeScript interfaces and data models for sales orders, quarterly metrics, hygiene reports, and analytics payloads. |
| `/src/utils/analytics.ts` | Performs deterministic business logic calculations, computing quarterly regional totals, variances, product rankings, and identification of the largest-shifting region. |
| `/src/utils/csvParser.ts` | Parses raw sales CSV files into structured order records, orchestrating header mapping, field validation, and data hygiene cleaning. |
| `/src/utils/dataSanitizer.ts` | Standardizes inconsistent text entries by trimming whitespace, correcting casing, and mapping regional aliases into canonical names. |
| `/src/utils/sampleData.ts` | Supplies clean and intentionally messy built-in CSV sales order datasets for immediate demonstration and testing. |
| `/tsconfig.json` | Configures the TypeScript compiler rules and path aliases for static type checking across the project. |
| `/vite.config.ts` | Defines the build tool and development server configuration, including React plugin support, path resolution, and styling plugins. |
