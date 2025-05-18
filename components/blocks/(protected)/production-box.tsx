import { ctaIcon } from '@/assets/home'
import { personaIcon, structureIcon, typeIcon } from '@/assets/home'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IdeaData, ScriptData } from '@/types/types'
import { Hourglass, Users, TextQuote, Calendar1Icon } from 'lucide-react'
import React from 'react'
import Image from 'next/image'
import { toneIcon } from '@/assets/home'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { useSidebarViewport } from '@/hooks/use-sidebar-viewport'
import { getEnumTranslation } from '@/utils/enum-translations'
import { useDictionary } from '@/app/context/dictionary-context'

const ProductionBox = ({ idea, script, isActive, setSelectedIdea }: { 
  idea: IdeaData, 
  script: ScriptData | null, 
  isActive: boolean, 
  setSelectedIdea: (idea: IdeaData) => void 
}) => {
	const { cardClasses } = useSidebarViewport()
	const { base, active, inactive, background } = cardClasses
	const dict = useDictionary()
	const locale = dict.locale

  return (
    <Card onClick={() => setSelectedIdea(idea)} className={cn(
      base,
      isActive ? active : inactive,
      background
    )} style={{ cursor: 'pointer' }}>
      {idea.pub_date ? (
        <p className='text-sm text-gray-500 px-6 pt-4 pb-2 flex items-center gap-1.5'>
          <Calendar1Icon className='text-red-500' size={16} /> 
          {formatDate(idea.pub_date, 'normal')}
        </p>
      ) : (
        <Link href={`ideas/${idea.id}`} className='text-sm text-gray-500 flex items-center gap-1.5 px-6 pt-4 hover:underline underline-offset-4 pb-3'>
          <Calendar1Icon className='text-red-500' size={16} /> 
          Please insert a publication date
        </Link>
      )}
      <CardHeader className='pt-0'>
        <CardTitle>{idea.title}</CardTitle>
        <CardDescription className='pt-2 text-gray-500 xl:line-clamp-3'>{idea.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Image src={toneIcon} alt="Tone Icon" width={16} height={16} />
					<p className="text-sm text-gray-500">{getEnumTranslation(script?.tone, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<TextQuote size={16} className=" text-green-500" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.verbosity, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Users size={16} className=" text-cyan-500" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.target_audience, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Image src={typeIcon} alt="Type Icon" width={16} height={16} className="" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.script_type, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Hourglass size={16} className=" text-orange-500" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.duration, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Image src={personaIcon} alt="Persona Icon" width={16} height={16} className="" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.persona, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Image src={structureIcon} alt="Structure Icon" width={16} height={16} className="" />
					<p className="text-sm text-gray-500 ">{getEnumTranslation(script?.structure, locale)}</p>
				</div>
				<div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
					<Image src={ctaIcon} alt="CTA Icon" width={16} height={16} className="" />
					<p className="text-sm text-gray-500 ">{script?.call_to_action === true ? dict.scriptPage.ctaYes : dict.scriptPage.ctaNo}</p>
				</div>
			</CardContent>
      
    </Card>
  )
}

export default ProductionBox