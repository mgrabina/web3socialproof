export const environments = ["development", "preview", "production"] as const;
export type Environment = (typeof environments)[number];

export const env = (process.env.VERCEL_ENV ??
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  "development") as Environment;

if (!environments.includes(env)) {
  console.error("Invalid env", env);

  throw new Error("Invalid env");
}

export const getPixelServerByEnvironment = (env: Environment): string => {
  switch (env) {
    case "production":
      return "https://pixel.gobyherd.com";
    case "preview":
      return "https://staging.pixel.gobyherd.com";
    case "development":
      return "http://localhost:3001";
    default:
      throw new Error("Invalid env");
  }
};

export const PUBLIC_URL = () => {
  switch (env) {
    case "production":
      return process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://app.gobyherd.com";
    case "preview":
      if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF == "main") {
        return "https://staging.app.gobyherd.com";
      } else {
        return process.env.NEXT_PUBLIC_VERCEL_URL;
      }
    case "development":
      return "http://localhost:3000";
  }
};

export const openRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/subscribe",
  "/public",
];
