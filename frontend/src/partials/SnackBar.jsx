import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearSelectedMedia } from "../features/chat/state/media";
export default function Snackbar({
  message,
  color = "bg-red-500",
  duration = 5000,
}) {
 
  const dispatch=useDispatch();
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSelectedMedia());
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);



  return (
    <div className="fixed bottom-5 right-5 w-80 rounded-lg bg-zinc-900 text-white shadow-lg overflow-hidden">
      <div className="p-4">{message}</div>

      <div
        className={`h-1 ${color} animate-progress`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}