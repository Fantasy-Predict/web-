"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  clearNotifications as apiClearNotifications,
  type BackendNotification,
} from "./api/endpoints";

export type Notification = {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: "prediction" | "pool" | "payment" | "system";
};

function fromBackend(n: BackendNotification): Notification {
  return {
    id: n._id,
    title: n.title,
    body: n.body,
    timestamp: new Date(n.createdAt).getTime(),
    read: n.read,
    type: n.type,
  };
}

// No-ops — notifications are now created server-side
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function addNotification(_input: unknown) {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function markRead(_id: string) {}
export function notifyPrediction(_title: string, _body: string) {}
export function notifyPool(_title: string, _body: string) {}
export function notifyPayment(_title: string, _body: string) {}
export function notifySystem(_title: string, _body: string) {}

export function clearAllNotifications() {
  apiClearNotifications().catch(() => {});
}

export function markAllRead() {
  markAllNotificationsRead().catch(() => {});
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isFetching = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const data = await getNotifications();
      setNotifications(data.map(fromBackend));
    } catch {
      // API unreachable — keep prior state
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    function onFocus() {
      fetchNotifications();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    apiClearNotifications().catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAllRead: handleMarkAllRead,
    markRead,
    clearAllNotifications: handleClearAll,
  };
}
