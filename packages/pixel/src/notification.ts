import { inferRouterOutputs } from "@trpc/server";
import { createNotification, notificationId } from "@web3socialproof/shared";
import { AppRouter } from "../../../apps/backend/src/trpc/router";

type NotificationOutput =
  inferRouterOutputs<AppRouter>["experiments"]["getNotification"];

const DEFAULT_DELAY = 300;

// Function to show a notification on the page
export function showNotification(params: NotificationOutput): void {
  if (!params) {
    return;
  }

  try {
    const delay =
      params.variant?.delay != undefined ? params.variant.delay : DEFAULT_DELAY;
    const notification = createNotification(params);

    setTimeout(() => {
      if (!notification) {
        return;
      }

      document.body.appendChild(notification);
    }, delay);

    if (params.variant?.timer) {
      setTimeout(() => {
        if (!notification) {
          return;
        }

        notification.remove();
      }, delay + params.variant?.timer);
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
