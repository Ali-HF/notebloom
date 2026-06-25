/**
 * Dispatch a custom browser event to display a toast notification
 */
export function showToast(message: string, type: "success" | "error" = "success") {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("notebloom-toast", { detail: { message, type } });
    window.dispatchEvent(event);
  }
}
