import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Clock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableScriptSectionProps } from "@/types/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SortableScriptSection = ({
  section,
  sectionIndex,
  isEditing,
  onUpdate,
  onRemove,
  onAddPoint,
  onRemovePoint,
  onToggleCollapse,
  script,
  setScript,
  dict,
}: SortableScriptSectionProps & {
  script: any;
  setScript: React.Dispatch<React.SetStateAction<any>>;
  dict: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: sectionIndex,
    data: {
      type: 'section',
      section,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  const validateTimeFormat = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (validateTimeFormat(value) || value === '') {
      onUpdate(sectionIndex, field, value);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-card transition-all duration-200 ${
        section.isCollapsed ? 'shadow-sm' : 'shadow-md'
      } ${isDragging ? 'ring-2 ring-primary/50' : ''}`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          {isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="cursor-grab active:cursor-grabbing touch-none p-1.5 rounded-md hover:bg-accent/50 transition-colors"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{dict.components.sortableScriptSection.dragToReorder}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={section.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  placeholder="00:00"
                  disabled={!isEditing}
                  className="font-mono w-20 h-8 text-sm"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  value={section.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  placeholder="00:00"
                  disabled={!isEditing}
                  className="font-mono w-20 h-8 text-sm"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {section.points.length} {section.points.length === 1 ? dict.components.sortableScriptSection.point : dict.components.sortableScriptSection.points}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(sectionIndex)}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{dict.components.sortableScriptSection.deleteSection}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleCollapse(sectionIndex)}
                className="h-8 w-8"
              >
                {section.isCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {!section.isCollapsed && (
          <div className=" pt-2 grid grid-cols-2 items-center gap-2">
            {section.points.map((point, pointIndex) => (
              <div key={pointIndex} className="flex gap-2 items-start group col-span-2 xl:col-span-1">
                <div className="mt-2 text-xs font-medium bg-accent/30 rounded-full w-5 h-5 flex items-center justify-center">
                  {pointIndex + 1}
                </div>
                <div className="flex-1 relative">
                  <Textarea
                    value={point}
                    onChange={(e) => {
                      const newContent = [...script.content];
                      newContent[sectionIndex].points[pointIndex] = e.target.value;
                      setScript({ ...script, content: newContent });
                    }}
                    disabled={!isEditing}
                    className="min-h-[80px] p-4 text-sm transition-all focus:ring-1 focus:ring-accent"
                    placeholder={dict.components.sortableScriptSection.placeholder}
                  />
                  {isEditing && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemovePoint(sectionIndex, pointIndex)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dict.components.sortableScriptSection.deletePoint}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 hover:bg-accent/20 text-sm"
                onClick={() => onAddPoint(sectionIndex)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {dict.components.sortableScriptSection.addPoint}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableScriptSection;