import { z } from "zod"

export const notificationTypeSchema = z.union([
  z.literal("swaps"),
  z.literal("TVL"),
  z.literal("walletsConnected")
])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationOptionsSchema = z.object({
  type: notificationTypeSchema,
  message: z.string()
})
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>

export const notificationStylingSchema = z.object({
  titleColor: z.string(),
  backgroundColor: z.string(),
  iconColor: z.string()
})
export type NotificationStyling = z.infer<typeof notificationStylingSchema>

export const notificationResponseSchema = z.object({
  type: notificationTypeSchema,
  icon: z.string(),
  message: z.string(),
  subMessage: z.string(),
  styling: notificationStylingSchema
})
export type NotificationResponse = z.infer<typeof notificationResponseSchema>


