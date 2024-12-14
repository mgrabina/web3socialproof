import { z } from "zod";
import { shortenAddress } from "../utils/evm";
import { createSvgIcon, isMobile } from "../utils/notification";

export const DestkopPositions = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;
export type DesktopPosition = (typeof DestkopPositions)[number];
export const MobilePositions = [
  "center",
  "bottom-center",
  "top-center",
  "none",
] as const;
export type MobilePosition = (typeof MobilePositions)[number];
export type Position = DesktopPosition | MobilePosition;

export const iconNames = ["flame", "growth", "checked", "money"] as const;
export type IconName = (typeof iconNames)[number];
export const isIconName = (name: string): name is IconName =>
  iconNames.includes(name as IconName);

// Optional schema where all fields are optional
export const notificationStylingSchemaOptional = z.object({
  fontFamily: z.string().optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  iconBackgroundColor: z.string().optional(),
  iconColor: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
  boxShadow: z.string().optional(),
  mobilePosition: z.enum(MobilePositions).optional(),
  desktopPosition: z.enum(DestkopPositions).optional(),
});

// Required schema where all fields are strictly required
export const notificationStylingSchemaRequired = z.object({
  fontFamily: z.string(),
  titleColor: z.string(),
  subtitleColor: z.string(),
  backgroundColor: z.string(),
  iconBackgroundColor: z.string(),
  iconBorderRadius: z.string(),
  iconColor: z.string(),
  borderRadius: z.string(),
  border: z.string(),
  boxShadow: z.string(),
  mobilePosition: z.enum(MobilePositions),
  desktopPosition: z.enum(DestkopPositions),
  showClosingButton: z.boolean(),
  showIcon: z.boolean(),
});

// Type definitions
export type NotificationStylingOptional = z.infer<
  typeof notificationStylingSchemaOptional
>;
export type NotificationStylingRequired = z.infer<
  typeof notificationStylingSchemaRequired
>;

export const defaultStyling: NotificationStylingRequired = {
  fontFamily: "Arial, sans-serif",
  titleColor: "#333",
  subtitleColor: "#888",
  border: "1px solid #e0e0e0",
  borderRadius: "100px",
  iconBorderRadius: "50%",
  backgroundColor: "#ffffff",
  iconBackgroundColor: "#FF6347",
  iconColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  mobilePosition: "bottom-center",
  desktopPosition: "bottom-left",
  showClosingButton: false,
  showIcon: true,
};

export const notificationOptionsSchema = z.object({
  variantId: z.number(),
  experimentId: z.number(),
  message: z.string(),
  subMessage: z.string(),
  iconName: z.enum(iconNames).optional(),
  iconSrc: z.string().optional(),
  delay: z.number().optional(),
  timer: z.number().optional(),
  subscriptionPlan: z.string(),
  styling: notificationStylingSchemaOptional,
  pathnames: z.array(z.string()).optional(),
});
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>;

export const verificationInfoSchema = z.object({
  chainId: z.number(),
  contractAddress: z.string(),
  isOwnershipVerified: z.boolean(),
  chainName: z.string().optional(),
  url: z.string().optional(),
});

export type VerificationInfo = z.infer<typeof verificationInfoSchema>;

export const notificationResponseSchema = z.object({
  variantId: z.number(),
  experimentId: z.number(),
  iconName: z.enum(iconNames).optional(),
  iconSrc: z.string().optional(),
  delay: z.number().optional(),
  timer: z.number().optional(),
  message: z.string(),
  subMessage: z.string(),
  verifications: z.array(verificationInfoSchema),
  styling: notificationStylingSchemaRequired,
  subscriptionPlan: z.string(),
  pathnames: z.array(z.string()).optional(),
});
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;

export type IconAttributes = {
  viewBox?: string;
  width?: string;
  height?: string;
  color?: string;
};

export const iconsSvgs: Record<IconName, () => SVGElement | null> = {
  flame: () =>
    createSvgIcon(
      [
        "M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952 c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029 c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851 c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386 c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073 c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826 C153.666,566.767,185.212,594.814,216.02,611.195z",
      ],
      {
        viewBox: "0 0 611.999 611.999",
      }
    ),
  growth: () =>
    createSvgIcon(
      [
        "M20,8v2h6.5859L18,18.5859,13.707,14.293a.9994.9994,0,0,0-1.414,0L2,24.5859,3.4141,26,13,16.4141l4.293,4.2929a.9994.9994,0,0,0,1.414,0L28,11.4141V18h2V8Z",
      ],
      { viewBox: "0 0 32 32" }
    ),
  checked: () =>
    createSvgIcon(
      [
        "M6.53 9.02 4.58 7.07l-.88.89 2.83 2.83.88-.89 4.78-4.77-.89-.88-4.77 4.77z",
        "M8 .5A7.77 7.77 0 0 0 0 8a7.77 7.77 0 0 0 8 7.5A7.77 7.77 0 0 0 16 8 7.77 7.77 0 0 0 8 .5zm0 13.75A6.52 6.52 0 0 1 1.25 8 6.52 6.52 0 0 1 8 1.75 6.52 6.52 0 0 1 14.75 8 6.52 6.52 0 0 1 8 14.25z",
      ],
      { viewBox: "0 0 16 16" }
    ),
  money: () =>
    createSvgIcon(
      [
        "M12.32 8a3 3 0 0 0-2-.7H5.63A1.59 1.59 0 0 1 4 5.69a2 2 0 0 1 0-.25 1.59 1.59 0 0 1 1.63-1.33h4.62a1.59 1.59 0 0 1 1.57 1.33h1.5a3.08 3.08 0 0 0-3.07-2.83H8.67V.31H7.42v2.3H5.63a3.08 3.08 0 0 0-3.07 2.83 2.09 2.09 0 0 0 0 .25 3.07 3.07 0 0 0 3.07 3.07h4.74A1.59 1.59 0 0 1 12 10.35a1.86 1.86 0 0 1 0 .34 1.59 1.59 0 0 1-1.55 1.24h-4.7a1.59 1.59 0 0 1-1.55-1.24H2.69a3.08 3.08 0 0 0 3.06 2.73h1.67v2.27h1.25v-2.27h1.7a3.08 3.08 0 0 0 3.06-2.73v-.34A3.06 3.06 0 0 0 12.32 8z",
      ],
      { viewBox: "0 0 16 16" }
    ),
};

// Define all positions with their CSS styles
export const positions: Record<Position, Partial<CSSStyleDeclaration>> = {
  "bottom-right": { bottom: "20px", right: "20px" },
  "bottom-left": { bottom: "20px", left: "20px" },
  "top-right": { top: "20px", right: "20px" },
  "top-left": { top: "20px", left: "20px" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "bottom-center": {
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
  none: {},
};

export const responsiveStyling = {
  mobile: {
    position: "bottom-center",
    titleFontSize: "16px",
    subtitleFontSize: "11px",
    verificationFontSize: "9px",
    width: "400px",
    height: "100px",
    padding: "15px",
    iconContainerWidth: "65px",
    iconContainerHeight: "65px",
    iconWidth: "20px",
    iconHeight: "20px",
    closeButtonMargin: "3em",
  },
  desktop: {
    titleFontSize: "18px",
    subtitleFontSize: "13px",
    verificationFontSize: "11px",
    width: "400px",
    height: "120px",
    padding: "20px",
    iconContainerWidth: "80px",
    iconContainerHeight: "80px",
    iconWidth: "24px",
    iconHeight: "24px",
    closeButtonMargin: "3em",
  },
};

export type PreviewConfig = {
  isPreview: boolean;
  isMobilePreview: boolean;
  isVerifiedPreview: boolean;
  previewMetrics: Set<string>;
};
export const defaultPreviewConfig = {
  isPreview: false,
  isMobilePreview: false,
  isVerifiedPreview: false,
  previewMetrics: new Set<string>(),
};



export const notificationId = "herd-notification";
