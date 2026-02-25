import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./index.css";
import { convex } from "./lib/convex-client";

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
