"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      theme="colored"
    />
  );
}
