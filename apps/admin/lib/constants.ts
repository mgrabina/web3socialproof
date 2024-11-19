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

export const PUBLIC_URL =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.NEXT_PUBLIC_VERCEL_URL ??
  "http://localhost:3000";
