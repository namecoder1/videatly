import { arrayMove } from "@dnd-kit/sortable";

import { DragEndEvent } from "@dnd-kit/core";
import { ScriptSection } from "@/types/types";

export const handleAddPoint = (
  script: any,
  sectionIndex: number,
  setScript: (script: any) => void
) => {
  const newContent = [...script.content];
  newContent[sectionIndex].points.push("");
  setScript({ ...script, content: newContent });
};

export const handleRemovePoint = (
  script: any,
  sectionIndex: number,
  pointIndex: number,
  setScript: (script: any) => void
) => {
  const newContent = [...script.content];
  newContent[sectionIndex].points.splice(pointIndex, 1);
  setScript({ ...script, content: newContent });
};

export const handleAddSection = (
  script: any,
  setScript: (script: any) => void
) => {
  const newContent = [...script.content];
  const lastSection = newContent[newContent.length - 1];
  const newStartTime = lastSection ? lastSection.endTime : "00:00";
  
  newContent.push({ 
    startTime: newStartTime, 
    endTime: "", 
    points: [""],
    isCollapsed: false
  });
  
  setScript({ ...script, content: newContent });
};

export const handleRemoveSection = (
  script: any,
  sectionIndex: number,
  setScript: (script: any) => void
) => {
  const newContent = [...script.content];
  newContent.splice(sectionIndex, 1);
  setScript({ ...script, content: newContent });
};

export const handleToggleCollapse = (
  script: any,
  sectionIndex: number,
  setScript: (script: any) => void
) => {
  const newContent = [...script.content];
  newContent[sectionIndex].isCollapsed = !newContent[sectionIndex].isCollapsed;
  setScript({ ...script, content: newContent });
};

export const handleDragStart = (
  event: any,
  setActiveId: (id: string | null) => void
) => {
  setActiveId(event.active.id);
};

export const handleDragEnd = (
  event: DragEndEvent, 
  setScript: (script: any) => void, 
  setActiveId: (id: string | null) => void
) => {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    setScript((prevScript: any) => {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      
      // Create a new array with the reordered sections
      const newContent = arrayMove(prevScript.content, oldIndex, newIndex) as ScriptSection[];
      
      // Update the times after reordering
      const adjustedContent = adjustTimesAfterReorder(newContent);
      
      // Return the new script state
      return {
        ...prevScript,
        content: adjustedContent,
      };
    });
  }
  
  setActiveId(null);
};

export const timeToSeconds = (time: string): number => {
  if (!time) return 0;
  const [minutes, seconds] = time.split(':').map(Number);
  return minutes * 60 + seconds;
};

export const secondsToTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const adjustTimesAfterReorder = (content: ScriptSection[]): ScriptSection[] => {
  // Keep the original order, don't sort by time
  return content.map((section, index) => {
    const prevSection = content[index - 1];
    const nextSection = content[index + 1];
    
    let startTime = section.startTime;
    let endTime = section.endTime;
    
    if (index === 0 && !startTime) {
      startTime = "00:00";
    }
    
    if (prevSection) {
      startTime = prevSection.endTime || startTime;
    }
    
    if (nextSection) {
      endTime = nextSection.startTime || endTime;
    }
    
    if (!endTime) {
      const startSeconds = timeToSeconds(startTime);
      endTime = secondsToTime(startSeconds + 30);
    }
    
    if (timeToSeconds(endTime) <= timeToSeconds(startTime)) {
      endTime = secondsToTime(timeToSeconds(startTime) + 30);
    }
    
    return {
      ...section,
      startTime,
      endTime,
    };
  });
};