"use client";

import { ModuleEditorLoader } from "../../components/module-editor-loader";
import StoryEditor from "../story-editor";

export default function StoryEditorContent() {
  return <ModuleEditorLoader>{(event) => <StoryEditor key={event._id} event={event} />}</ModuleEditorLoader>;
}
