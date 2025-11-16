/**
 * Simple toast notification utility
 * In production, consider using a library like react-hot-toast or sonner
 */

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function toast(options: ToastOptions | string) {
  const message = typeof options === "string" ? options : options.message;
  const type = typeof options === "string" ? "info" : options.type || "info";
  
  // Simple console log for now
  // TODO: Implement proper toast notifications with a library
  console.log(`[${type.toUpperCase()}] ${message}`);
}

toast.success = (message: string) => toast({ message, type: "success" });
toast.error = (message: string) => toast({ message, type: "error" });
toast.warning = (message: string) => toast({ message, type: "warning" });
toast.info = (message: string) => toast({ message, type: "info" });

