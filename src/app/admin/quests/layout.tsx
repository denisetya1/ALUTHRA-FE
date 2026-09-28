import type { ReactNode } from "react";
import QuestActions from "./components/quest-actions";
export default function QuestLayout({children}:{children:ReactNode}){return <><QuestActions/>{children}</>;}
