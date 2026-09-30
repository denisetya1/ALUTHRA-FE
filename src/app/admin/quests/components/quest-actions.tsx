"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuestActions(){const pathname=usePathname();if(pathname.includes("/new")||pathname.endsWith("/edit"))return null;const parts=pathname.split("/").filter(Boolean).slice(2);let add="";let edit="";let label="";if(parts.length===0){add="/admin/quests/new";label="Add arc";}else if(parts.length===1){edit=`${pathname}/edit`;add=`${pathname}/chapters/new`;label="Add chapter";}else if(parts.length===2){edit=`${pathname}/edit`;add=`${pathname}/regions/new`;label="Add region";}else if(parts.length===3){edit=`${pathname}/edit`;add=`${pathname}/quests/new`;label="Add quest";}else{return null;}return <div className="mb-4 flex justify-end gap-2">{edit&&<Button variant="outline" asChild><Link href={edit}><Pencil/>Edit</Link></Button>}<Button asChild><Link href={add}><Plus/>{label}</Link></Button></div>}
