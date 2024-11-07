import { NotificationOptions } from "../constant/notification";

export const getNotification = ({
  hostname,
  apiKey,
}: {
  hostname: string;
  apiKey: string;
}): NotificationOptions => {
  // Check if client has credits

  // Check if there are customizations

  // Decorate

  return {
    message: "Notification from backend",
    type: "swaps",
  };
};
