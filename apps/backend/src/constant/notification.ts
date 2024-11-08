import { z } from "zod";

export const notificationTypeSchema = z.union([
  z.literal("swaps"),
  z.literal("TVL"),
  z.literal("walletsConnected"),
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

// Optional schema where all fields are optional
export const notificationStylingSchemaOptional = z.object({
  fontFamily: z.string().optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
  boxShadow: z.string().optional(),
});

// Required schema where all fields are strictly required
export const notificationStylingSchemaRequired = z.object({
  fontFamily: z.string(),
  titleColor: z.string(),
  subtitleColor: z.string(),
  backgroundColor: z.string(),
  borderRadius: z.string(),
  boxShadow: z.string(),
});

// Type definitions
export type NotificationStylingOptional = z.infer<typeof notificationStylingSchemaOptional>;
export type NotificationStylingRequired = z.infer<typeof notificationStylingSchemaRequired>;


export const notificationOptionsSchema = z.object({
  type: notificationTypeSchema,
  message: z.string(),
  subMessage: z.string(),
  styling: notificationStylingSchemaOptional,
});
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>;

export const notificationResponseSchema = z.object({
  type: notificationTypeSchema,
  icon: z.string(),
  message: z.string(),
  subMessage: z.string(),
  verificationLink: z.string(),
  styling: notificationStylingSchemaRequired,
});
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
