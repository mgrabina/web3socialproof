// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  environment:
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.NODE_ENV ||
    "development",

  dsn: "https://54a8566323640fcbd4813b89b2ffaabb@o4508520360378368.ingest.us.sentry.io/4508520385282048",
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
