import { createRoot } from "react-dom/client";
import "./styles.css";
import { PublicSite } from "./modules/public/PublicSite";
createRoot(document.getElementById("root")!).render(<PublicSite />);
