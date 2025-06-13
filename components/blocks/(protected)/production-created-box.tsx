import { ctaIcon } from '@/assets/home'
import { personaIcon, structureIcon, typeIcon } from '@/assets/home'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IdeaData, ScriptData, ProductionData } from '@/types/types'
import { Hourglass, Users, TextQuote, Calendar1Icon, Video, CheckCircle, Clock } from 'lucide-react'
import React from 'react'
import Image from 'next/image'
import { toneIcon } from '@/assets/home'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { useSidebarViewport } from '@/hooks/use-sidebar-viewport'
import { getEnumTranslation } from '@/utils/enum-translations'
import { useDictionary } from '@/app/context/dictionary-context'
import { Badge } from '@/components/ui/badge'

type ProductionCreatedData = ProductionData & {
  ideas: IdeaData,
  scripts: ScriptData
}

const ProductionCreatedBox = ({ production }: { production: ProductionCreatedData }) => {
  const { cardClasses } = useSidebarViewport()
  const { base, background } = cardClasses
  const dict = useDictionary()
  const locale = dict.locale

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </Badge>
        )
      case 'creating':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <Clock size={12} className="mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  return (
    <Link href={`/production/${production.id}`}>
      <Card className={cn(
        base,
        background,
        "hover:shadow-md transition-shadow cursor-pointer"
      )}>
        <div className='flex justify-between items-center px-6 pt-4 pb-3'>
          {getStatusBadge(production.status)}
          <div className='flex items-center gap-2'>
            {production.ideas.pub_date && (
              <p className='text-sm text-gray-500  flex items-center gap-1.5'>
                <Calendar1Icon className='text-red-500' size={16} /> 
                {formatDate(production.ideas.pub_date, 'normal')}
              </p>
            )}
          </div>
        </div>
       

        <CardHeader className='pt-0'>
          <CardTitle>{production.ideas.title}</CardTitle>
          <CardDescription className='pt-2 text-gray-500 xl:line-clamp-3'>
            {production.ideas.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Image src={toneIcon} alt="Tone Icon" width={16} height={16} />
            <p className="text-sm text-gray-500">{getEnumTranslation(production.scripts?.tone, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <TextQuote size={16} className=" text-green-500" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.verbosity, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Users size={16} className=" text-cyan-500" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.target_audience, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Image src={typeIcon} alt="Type Icon" width={16} height={16} className="" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.script_type, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Hourglass size={16} className=" text-orange-500" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.duration, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Image src={personaIcon} alt="Persona Icon" width={16} height={16} className="" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.persona, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Image src={structureIcon} alt="Structure Icon" width={16} height={16} className="" />
            <p className="text-sm text-gray-500 ">{getEnumTranslation(production.scripts?.structure, locale)}</p>
          </div>
          <div className="flex items-center p-1.5 gap-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Image src={ctaIcon} alt="CTA Icon" width={16} height={16} className="" />
            <p className="text-sm text-gray-500 ">{production.scripts?.call_to_action === true ? dict.scriptPage.ctaYes : dict.scriptPage.ctaNo}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ProductionCreatedBox 