import {
  NotificationOptions,
  NotificationResponse,
} from "../constant/notification";

export const decorateNotification = ({
  type,
}: NotificationOptions): NotificationResponse => {
  return {
    type,
    icon: "🎉",
    message: "Notification decorated in backend!",
    subMessage: "This is a sub message",
    styling: {
      titleColor: "black",
      backgroundColor: "white",
      iconColor: "black",
    },
  };
};
