const pixelEnvList = ["development", "production", "test"] as const;
export type PixelEnv = (typeof pixelEnvList)[number];

export const isPixelEnv = (env: string | null): env is PixelEnv =>
  pixelEnvList.includes(env as PixelEnv);
