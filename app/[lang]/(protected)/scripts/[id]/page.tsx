'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Save, Clock, GripVertical, ChevronDown, ChevronUp, Edit, NotepadText, Link2, Hourglass, TextQuote, Users, CircleHelp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import Image from 'next/image'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMediaQuery } from '@/hooks/use-media-query'
import Loader from '@/components/blocks/loader'
import { ScriptSection, TodoProps } from '@/types/types'
import SortableScriptSection from '@/components/blocks/(protected)/sortable-script-section'
import { handleDragStart, handleDragEnd, handleAddPoint, handleRemovePoint, handleAddSection, handleRemoveSection, handleToggleCollapse, adjustTimesAfterReorder } from './actions'
import ErrorMessage from '@/components/blocks/(protected)/error-message'
import CustomIcon from '@/components/ui/custom-icon'
import TodoLittle from '@/components/blocks/(protected)/todo-little'
import Link from 'next/link'
import { structureIcon, personaIcon, toneIcon, typeIcon, ctaIcon } from '@/assets/home'
import { useDictionary } from '@/app/context/dictionary-context'
import CustomLink from '@/components/blocks/custom-link'
import { getEnumTranslation } from '@/utils/enum-translations'

const ScriptPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
	const dict = useDictionary();
	const locale = dict.locale || 'it';
  const supabase = createClient();
  const [script, setScript] = useState<any>(null);
  const [idea, setIdea] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCollapsed, setAllCollapsed] = useState(true);
  const [todos, setTodos] = useState<TodoProps[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: scriptData, error: scriptError } = await supabase
          .from("scripts")
          .select("*")
          .eq("id", id)
          .single();

        if (scriptError) {
          setError(scriptError.message);
          return;
        }

        // Add isCollapsed property to each section
        const contentWithCollapse = scriptData.content.map((section: ScriptSection) => ({
          ...section,
          isCollapsed: true
        }));
        scriptData.content = contentWithCollapse;

        const { data: ideaData, error: ideaError } = await supabase
          .from("ideas")
          .select("*")
          .eq("id", scriptData?.idea_id)
          .single();

        if (ideaError) {
          setError(ideaError.message);
          return;
        }

        const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select("*")
        .eq("idea_id", scriptData?.idea_id)

      if (todosError) {
        toast({
          title: dict.scriptPage.toast.todoLoadingError.title,
          description: todosError.message,
          variant: "destructive"
        });
      }

        setScript(scriptData);
        setIdea(ideaData);
        setTodos(todosData || []);
      } catch (err) {
        setError(dict.scriptPage.toast.scriptLoadingError.title);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, supabase, toast, dict.scriptPage.toast.scriptLoadingError.title, dict.scriptPage.toast.todoLoadingError.title]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("scripts")
        .update({ content: script.content })
        .eq("id", id);

      if (error) {
        toast({
          title: dict.scriptPage.toast.scriptSavedError.title,
          description: dict.scriptPage.toast.scriptSavedError.description,
          variant: "destructive"
        });
        return;
      };
      
      toast({
        title: dict.scriptPage.toast.scriptSavedSuccess.title,
        description: dict.scriptPage.toast.scriptSavedSuccess.description,
        variant: "success"
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAllCollapse = () => {
    setScript((prevScript: any) => {
      const newContent = prevScript.content.map((section: ScriptSection) => ({
        ...section,
        isCollapsed: !allCollapsed
      }));
      return {
        ...prevScript,
        content: newContent
      };
    });
    setAllCollapsed(!allCollapsed);
  };

  if (loading) return <Loader position='full' />
  if (error) return <ErrorMessage error={dict.scriptPage.errorMessage} />
  if (!script || !idea) return <ErrorMessage error={dict.scriptPage.errorMessage2} />

  const content = script.content as ScriptSection[];

  return (
    <section className='space-y-4 w-full max-w-full'>
      <div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<NotepadText />} color='red' />
          <h1 className='text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16'>{idea.title}</h1>
        </div>
        <Separator className='my-2' />
      </div>		

      <div className='flex flex-col 2xl:flex-row items-start gap-4'>
        <Card className="mb-8 shadow-sm w-full">
          <CardHeader className="flex flex-col items-start justify-between bg-accent/30 space-y-4 md:space-y-0 pb-0">
            <div className="flex justify-between items-center gap-2 w-full mb-2">
              <CardTitle className="text-2xl font-bold">
                {idea.title}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {idea.description}
            </CardDescription>
            
            <div className='block 2xl:hidden w-full'>
              <Separator className='mt-4' />
              <div className='flex flex-wrap items-start justify-start gap-4 py-4'>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Image src={toneIcon} alt="Tone Icon" width={16} height={16} />
                  <p className="text-xs text-gray-500">{getEnumTranslation(script.tone, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <TextQuote size={16} className=" text-green-500" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.verbosity, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Users size={16} className=" text-cyan-500" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.target_audience, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Image src={typeIcon} alt="Type Icon" width={16} height={16} className="" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.script_type, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Hourglass size={16} className=" text-orange-500" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.duration, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Image src={personaIcon} alt="Persona Icon" width={16} height={16} className="" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.persona, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Image src={structureIcon} alt="Structure Icon" width={16} height={16} className="" />
                  <p className="text-xs text-gray-500 ">{getEnumTranslation(script.structure, locale as string)}</p>
                </div>
                <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Image src={ctaIcon} alt="CTA Icon" width={16} height={16} className="" />
                  <p className="text-xs text-gray-500 ">{script.call_to_action === true ? dict.scriptPage.ctaYes : dict.scriptPage.ctaNo}</p>
                </div>
              </div>
              <Separator className='mb-4' />
            </div>

          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => handleDragStart(event, (id) => setActiveId(id ? Number(id) : null))}
              onDragEnd={(event) => handleDragEnd(event, setScript, (id) => setActiveId(id ? Number(id) : null))}
            >
              <SortableContext
                items={content.map((_, index) => index)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 rounded-lg">
                  {content.map((section, sectionIndex) => (
                    <SortableScriptSection
                      dict={dict}
                      key={sectionIndex}
                      section={section}
                      sectionIndex={sectionIndex}
                      isEditing={isEditing}
                      onUpdate={(index: number, field: string, value: string) => {
                        setScript((prevScript: any) => {
                          const newContent = [...prevScript.content];
                          newContent[index][field] = value;
                          const adjustedContent = adjustTimesAfterReorder(newContent);
                          return {
                            ...prevScript,
                            content: adjustedContent,
                          };
                        });
                      }}
                      onRemove={(index) => handleRemoveSection(script, index, setScript)}
                      onAddPoint={(index) => handleAddPoint(script, index, setScript)}
                      onRemovePoint={(sectionIndex, pointIndex) => handleRemovePoint(script, sectionIndex, pointIndex, setScript)}
                      onToggleCollapse={(index) => handleToggleCollapse(script, index, setScript)}
                      script={script}
                      setScript={setScript}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay className='rounded-lg'>
                {activeId !== null && (
                  <div className="space-y-2 p-3 rounded-lg border backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <div className="font-mono text-sm">{content[activeId].startTime}</div>
                        <span className="text-muted-foreground">-</span>
                        <div className="font-mono text-sm">{content[activeId].endTime}</div>
                      </div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
            
            {isEditing && (
              <Button
                variant="outline"
                className="w-full mt-4 hover:bg-accent/20 text-sm"
                onClick={() => handleAddSection(script, setScript)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {dict.scriptPage.addSection}
              </Button>
            )}
          </CardContent>
        </Card>
        <div className='flex flex-row 2xl:flex-col gap-4 w-full 2xl:w-auto'>
          <Card className='w-full h-full hidden 2xl:block'>
            <CardHeader>
              <CardTitle>
                {dict.scriptPage.scriptInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-y-6 gap-x-16'>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image src={toneIcon} alt="Tone Icon" width={16} height={16} />
                <p className="text-xs text-gray-500">{getEnumTranslation(script.tone, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <TextQuote size={16} className=" text-green-500" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.verbosity, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Users size={16} className=" text-cyan-500" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.target_audience, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image src={typeIcon} alt="Type Icon" width={16} height={16} className="" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.script_type, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Hourglass size={16} className=" text-orange-500" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.duration, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image src={personaIcon} alt="Persona Icon" width={16} height={16} className="" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.persona, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image src={structureIcon} alt="Structure Icon" width={16} height={16} className="" />
                <p className="text-xs text-gray-500 ">{getEnumTranslation(script.structure, locale as string)}</p>
              </div>
              <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image src={ctaIcon} alt="CTA Icon" width={16} height={16} className="" />
                <p className="text-xs text-gray-500 ">{script.call_to_action === true ? dict.scriptPage.ctaYes : dict.scriptPage.ctaNo}</p>
              </div>
            </CardContent>
          </Card>
          <Card className='2xl:max-w-sm w-full h-full'>
            <CardHeader className='flex flex-row justify-between items-center'>
              <CardTitle>Todos</CardTitle>
              <CardDescription>
                <CustomLink href={`/production/${id}`} className='flex items-center gap-2 hover:underline underline-offset-4'>
                  <Link2 className='w-4 h-4' />
                  {dict.scriptPage.viewProduction}
                </CustomLink>
              </CardDescription>
            </CardHeader>
            <CardContent className='w-full'>
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:flex 2xl:flex-col gap-2'>
                {todos.length > 0 ? (
                  todos.map((todo) => (
                    <TodoLittle key={todo.id} todo={todo} />
                  ))
                ) : (
                  <div className='text-sm text-muted-foreground flex flex-col items-center gap-1'>
                    <CircleHelp size={24} />
                    <p>{dict.scriptPage.noTodosFound}</p>
                    <Button variant='black' size='sm' className='mt-2' asChild>
                      <Link href={`/production/${id}`}>
                        {dict.scriptPage.createTodos}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='fixed right-4 bottom-4 flex flex-col justify-center items-end gap-2'>
        <Button
          variant="black"
          size="sm"
          onClick={handleToggleAllCollapse}
          className="gap-2"
        >
          {allCollapsed ? (
            <>
              <ChevronDown className="w-4 h-4" />
              {!isMobile && dict.scriptPage.expandAll}
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              {!isMobile && dict.scriptPage.collapseAll}
            </>
          )}
        </Button>
        {isEditing ? (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            variant="outline"
            className="gap-2"
            size={isMobile ? "sm" : "default"}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {!isMobile && dict.scriptPage.saveChanges}
          </Button>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            {!isMobile && dict.scriptPage.edit}
          </Button>
        )}
      </div>
    </section>
  );
};

export default ScriptPage;