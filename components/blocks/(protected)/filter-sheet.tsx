'use client'

import { Sheet, SheetHeader, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VideoType, VideoContentStyle, VideoTargetInterest, ScriptTone, ScriptType, ScriptDuration, VideoLength, ScriptTarget, ScriptPersona, ScriptStructure, ScriptVerbosity } from '@/types/enum'
import { CalendarArrowUp, Clock4, Film, Hourglass, Paintbrush, Target, Users, TextQuote } from 'lucide-react'
import { typeIcon, toneIcon, personaIcon, structureIcon } from '@/assets/home'
import Image from 'next/image'
import Fakebox from './fakebox'
import { useSheet } from '@/components/ui/sheet-context'
import React from 'react'
import { getEnumTranslation } from '@/utils/enum-translations'

export type FilterType = {
  videoType?: string | null
  contentStyle?: string | null
  length?: string | null
  scriptType?: string | null
  tone?: string | null
  duration?: string | null
  targetInterest?: string | null
  scriptTarget?: string | null
  sortBy: 'newest' | 'oldest' | null
  persona?: string | null
  structure?: string | null
  verbosity?: string | null
  callToAction?: boolean | null
}

interface FilterSheetProps {
  handleFilter: (type: keyof FilterType, value: string) => void
  activeFilters: FilterType
  setIsSheetOpen: (value: boolean) => void
  isSheetOpen: boolean
  title: string
  showScriptFilters?: boolean
  showIdeaFilters?: boolean
  showProductionFilter?: boolean
  dict: any
}

const FilterSheet = ({ 
  handleFilter, 
  activeFilters, 
  setIsSheetOpen, 
  isSheetOpen,
  title,
  showScriptFilters = false,
  showIdeaFilters = false,
  showProductionFilter = false,
  dict
}: FilterSheetProps) => {
  const { setIsAnySheetOpen } = useSheet()
  const handleSelectChange = (type: keyof FilterType, value: string) => {
    handleFilter(type, value)
  }

  // Assicuriamoci che la locale sia correttamente definita
  const locale = dict?.locale || 'en';

  React.useEffect(() => {
    setIsAnySheetOpen(isSheetOpen)
  }, [isSheetOpen, setIsAnySheetOpen])

  // Funzione di rendering personalizzata per SelectValue
  const renderSelectedValue = (value: string | null | undefined, placeholder: string): string => {
    if (!value || value === 'all') return placeholder;
    
    // Log di debug per verificare i valori tradotti
    const translated = getEnumTranslation(value, locale);
    console.log(`Translating ${value} to ${translated} (locale: ${locale})`);
    return translated;
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => {
      setIsSheetOpen(open)
      setIsAnySheetOpen(open)
    }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className='mt-6 space-y-6'>
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <CalendarArrowUp className='w-4 h-4 text-gray-500' />
              {dict.components.filterSheet.sortBy}
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <Fakebox activeFilters={activeFilters} handleSelectChange={handleSelectChange} selecter='newest' dict={dict} />
              <Fakebox activeFilters={activeFilters} handleSelectChange={handleSelectChange} selecter='oldest' dict={dict} />
            </div>
          </div>

          {showProductionFilter && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={toneIcon} alt="Tone" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptTone || "Script Tone"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('tone', value)} 
                  value={activeFilters.tone || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectTone || "Select tone"}>
                      {renderSelectedValue(activeFilters.tone, dict.components.filterSheet?.selectTone || "Select tone")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTones || "All tones"}</SelectItem>
                    {Object.values(ScriptTone).map(tone => (
                      <SelectItem key={tone} value={tone}>
                        {getEnumTranslation(tone, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <TextQuote className='w-4 h-4 text-green-500' />
                  {dict.components.filterSheet?.scriptVerbosity || "Verbosity"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('verbosity', value)} 
                  value={activeFilters.verbosity || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectVerbosity || "Select verbosity"}>
                      {renderSelectedValue(activeFilters.verbosity, dict.components.filterSheet?.selectVerbosity || "Select verbosity")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allVerbosities || "All verbosities"}</SelectItem>
                    {Object.values(ScriptVerbosity).map(verbosity => (
                      <SelectItem key={verbosity} value={verbosity}>
                        {getEnumTranslation(verbosity as string, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Users className='w-4 h-4 text-blue-500' />
                  {dict.components.filterSheet?.targetAudience || "Target Audience"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('scriptTarget', value)} 
                  value={activeFilters.scriptTarget || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectTargetAudience || "Select target audience"}>
                      {renderSelectedValue(activeFilters.scriptTarget, dict.components.filterSheet?.selectTargetAudience || "Select target audience")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTargetAudiences || "All target audiences"}</SelectItem>
                    {Object.values(ScriptTarget).map(target => (
                      <SelectItem key={target} value={target}>
                        {getEnumTranslation(target, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={typeIcon} alt="Type" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptType || "Script Type"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('scriptType', value)} 
                  value={activeFilters.scriptType || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectScriptType || "Select script type"}>
                      {renderSelectedValue(activeFilters.scriptType, dict.components.filterSheet?.selectScriptType || "Select script type")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTypes || "All types"}</SelectItem>
                    {Object.values(ScriptType).map(type => (
                      <SelectItem key={type} value={type}>
                        {getEnumTranslation(type, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Hourglass className='w-4 h-4 text-amber-500' />
                  {dict.components.filterSheet?.duration || "Duration"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('duration', value)} 
                  value={activeFilters.duration || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectDuration || "Select duration"}>
                      {renderSelectedValue(activeFilters.duration, dict.components.filterSheet?.selectDuration || "Select duration")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allDurations || "All durations"}</SelectItem>
                    {Object.values(ScriptDuration).map(duration => (
                      <SelectItem key={duration} value={duration}>
                        {getEnumTranslation(duration, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={personaIcon} alt="Persona" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptPersona || "Script Persona"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('persona', value)} 
                  value={activeFilters.persona || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectPersona || "Select persona"}>
                      {renderSelectedValue(activeFilters.persona, dict.components.filterSheet?.selectPersona || "Select persona")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allPersonas || "All personas"}</SelectItem>
                    {Object.values(ScriptPersona).map(persona => (
                      <SelectItem key={persona} value={persona}>
                        {getEnumTranslation(persona, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={structureIcon} alt="Structure" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptStructure || "Script Structure"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('structure', value)} 
                  value={activeFilters.structure || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectStructure || "Select structure"}>
                      {renderSelectedValue(activeFilters.structure, dict.components.filterSheet?.selectStructure || "Select structure")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allStructures || "All structures"}</SelectItem>
                    {Object.values(ScriptStructure).map(structure => (
                      <SelectItem key={structure} value={structure}>
                        {getEnumTranslation(structure, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {showScriptFilters && !showProductionFilter && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Hourglass className='w-4 h-4 text-amber-500' />
                  {dict.components.filterSheet?.duration || "Duration"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('duration', value)} 
                  value={activeFilters.duration || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectDuration || "Select duration"}>
                      {renderSelectedValue(activeFilters.duration, dict.components.filterSheet?.selectDuration || "Select duration")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allDurations || "All durations"}</SelectItem>
                    {Object.values(ScriptDuration).map(duration => (
                      <SelectItem key={duration} value={duration}>
                        {getEnumTranslation(duration, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={typeIcon} alt="Type" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptType || "Script Type"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('scriptType', value)} 
                  value={activeFilters.scriptType || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectScriptType || "Select script type"}>
                      {renderSelectedValue(activeFilters.scriptType, dict.components.filterSheet?.selectScriptType || "Select script type")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTypes || "All types"}</SelectItem>
                    {Object.values(ScriptType).map(type => (
                      <SelectItem key={type} value={type}>
                        {getEnumTranslation(type, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={personaIcon} alt="Persona" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptPersona || "Script Persona"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('persona', value)} 
                  value={activeFilters.persona || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectPersona || "Select persona"}>
                      {renderSelectedValue(activeFilters.persona, dict.components.filterSheet?.selectPersona || "Select persona")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allPersonas || "All personas"}</SelectItem>
                    {Object.values(ScriptPersona).map(persona => (
                      <SelectItem key={persona} value={persona}>
                        {getEnumTranslation(persona, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={structureIcon} alt="Structure" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptStructure || "Script Structure"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('structure', value)} 
                  value={activeFilters.structure || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectStructure || "Select structure"}>
                      {renderSelectedValue(activeFilters.structure, dict.components.filterSheet?.selectStructure || "Select structure")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allStructures || "All structures"}</SelectItem>
                    {Object.values(ScriptStructure).map(structure => (
                      <SelectItem key={structure} value={structure}>
                        {getEnumTranslation(structure, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Image src={toneIcon} alt="Tone" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
                  {dict.components.filterSheet?.scriptTone || "Script Tone"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('tone', value)} 
                  value={activeFilters.tone || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectTone || "Select tone"}>
                      {renderSelectedValue(activeFilters.tone, dict.components.filterSheet?.selectTone || "Select tone")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTones || "All tones"}</SelectItem>
                    {Object.values(ScriptTone).map(tone => (
                      <SelectItem key={tone} value={tone}>
                        {getEnumTranslation(tone, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Users className='w-4 h-4 text-blue-500' />
                  {dict.components.filterSheet?.targetAudience || "Target Audience"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('scriptTarget', value)} 
                  value={activeFilters.scriptTarget || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectTargetAudience || "Select target audience"}>
                      {renderSelectedValue(activeFilters.scriptTarget, dict.components.filterSheet?.selectTargetAudience || "Select target audience")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTargetAudiences || "All target audiences"}</SelectItem>
                    {Object.values(ScriptTarget).map(target => (
                      <SelectItem key={target} value={target}>
                        {getEnumTranslation(target, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {showIdeaFilters && !showProductionFilter && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Film className='w-4 h-4 text-purple-500' />
                  {dict.components.filterSheet?.videoType || "Video Type"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('videoType', value)} 
                  value={activeFilters.videoType || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectVideoType || "Select video type"}>
                      {renderSelectedValue(activeFilters.videoType, dict.components.filterSheet?.selectVideoType || "Select video type")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allVideoTypes || "All video types"}</SelectItem>
                    {Object.values(VideoType).map(type => (
                      <SelectItem key={type} value={type}>
                        {getEnumTranslation(type, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Paintbrush className='w-4 h-4 text-blue-500' />
                  {dict.components.filterSheet?.contentStyle || "Content Style"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('contentStyle', value)} 
                  value={activeFilters.contentStyle || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectContentStyle || "Select content style"}>
                      {renderSelectedValue(activeFilters.contentStyle, dict.components.filterSheet?.selectContentStyle || "Select content style")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allStyles || "All styles"}</SelectItem>
                    {Object.values(VideoContentStyle).map(style => (
                      <SelectItem key={style} value={style}>
                        {getEnumTranslation(style, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Clock4 className='w-4 h-4 text-amber-500' />
                  {dict.components.filterSheet?.videoLength || "Video Length"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('length', value)} 
                  value={activeFilters.length || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectVideoLength || "Select video length"}>
                      {renderSelectedValue(activeFilters.length, dict.components.filterSheet?.selectVideoLength || "Select video length")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allVideoLengths || "All video lengths"}</SelectItem>
                    {Object.values(VideoLength).map(length => (
                      <SelectItem key={length} value={length}>
                        {getEnumTranslation(length, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Target className='w-4 h-4 text-red-500' />
                  {dict.components.filterSheet?.targetInterest || "Target Interest"}
                </h3>
                <Select 
                  onValueChange={(value) => handleSelectChange('targetInterest', value)} 
                  value={activeFilters.targetInterest || 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dict.components.filterSheet?.selectTargetInterest || "Select target interest"}>
                      {renderSelectedValue(activeFilters.targetInterest, dict.components.filterSheet?.selectTargetInterest || "Select target interest")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dict.components.filterSheet?.allTargetInterests || "All target interests"}</SelectItem>
                    {Object.values(VideoTargetInterest).map(target => (
                      <SelectItem key={target} value={target}>
                        {getEnumTranslation(target, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default FilterSheet 