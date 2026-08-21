"use client";

import { useEffect, useState, useCallback } from "react";

export type Notification = {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: "prediction" | "pool" | "payment" | "system";
};

type NotificationInput = Omit<Notification, "id" | "timestamp" | "read">;

const STORAGE_KEY = "fp_notifications";
const MAX_NOTIFICATIONS = 50;

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
}

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function addNotification(input: NotificationInput) {
  const notifications = loadNotifications();
  const newNotification: Notification = {
    ...input,
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  emitChange();
}

export function markAllRead() {
  const notifications = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifications);
  emitChange();
}

export function markRead(id: string) {
  const notifications = loadNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(notifications);
  emitChange();
}

export function clearAllNotifications() {
  saveNotifications([]);
  emitChange();
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotifications());

  const subscribe = useCallback(() => {
    function onStoreChange() {
      setNotifications(loadNotifications());
    }
    listeners.push(onStoreChange);
    return () => {
      listeners = listeners.filter((l) => l !== onStoreChange);
    };
  }, []);

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAllRead, markRead, clearAllNotifications };
}

export function notifyPrediction(title: string, body: string) {
  addNotification({ title, body, type: "prediction" });
}

export function notifyPool(title: string, body: string) {
  addNotification({ title, body, type: "pool" });
}

export function notifyPayment(title: string, body: string) {
  addNotification({ title, body, type: "payment" });
}

export function notifySystem(title: string, body: string) {
  addNotification({ title, body, type: "system" });
}
