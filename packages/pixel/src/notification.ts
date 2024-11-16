import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../apps/backend/src/trpc/router";
import { createNotification } from "@web3socialproof/shared";

type NotificationOutput =
  inferRouterOutputs<AppRouter>["campaigns"]["getNotification"];

// Function to show a notification on the page
export function showNotification(params: NotificationOutput): void {

  try {
    const notification = createNotification(params);

    // Todo: replace timer for recognizing when DOM is really loaded
    setTimeout(() => {
      document.body.appendChild(notification);
    }, 3000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}
