import { inferRouterOutputs } from "@trpc/server";
import { createNotification, notificationId } from "@web3socialproof/shared";
import { AppRouter } from "../../../apps/backend/src/trpc/router";

type NotificationOutput =
  inferRouterOutputs<AppRouter>["campaigns"]["getNotification"];

// Function to show a notification on the page
export function showNotification(params: NotificationOutput): void {
  try {
    const notification = createNotification(params);

    const delay = Math.max(2000, params.delay ?? 0); // Todo: replace 0 for recognizing when DOM is really loaded

    setTimeout(() => {
      document.body.appendChild(notification);
    }, delay);

    if (params.timer) {
      setTimeout(() => {
        notification.remove();
      }, delay + params.timer);
    }
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

export function hideNotification() {
  const notificationElement = document.getElementById(notificationId);
  if (notificationElement) {
    notificationElement.remove();
  }
}
