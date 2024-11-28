import { inferRouterOutputs } from "@trpc/server";
import { createNotification, notificationId } from "@web3socialproof/shared";
import { AppRouter } from "../../../apps/backend/src/trpc/router";

type NotificationOutput =
  inferRouterOutputs<AppRouter>["campaigns"]["getNotification"];

// Function to show a notification on the page
export function showNotification(params: NotificationOutput): void {
  if (!params) {
    return;
  }

  try {
    const delay = params.delay ?? 300;
    const notification = createNotification(params);

    setTimeout(() => {
      if (!notification) {
        console.error("[Herd] Failed to create notification element.");
        return;
      }

      document.body.appendChild(notification);
    }, delay);

    if (params.timer) {
      setTimeout(() => {
        if (!notification) {
          return;
        }

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
