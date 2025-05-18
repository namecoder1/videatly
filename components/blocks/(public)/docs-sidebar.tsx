'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { EditIcon } from 'lucide-react'
import CustomLink from '../custom-link'
import { useDictionary } from '@/app/context/dictionary-context'


interface Section {
  id: string
  title: string
}

export function DocsSidebar({ sections }: { sections: Section[] }) {
  const [activeSection, setActiveSection] = useState<string>('')

  const dict = useDictionary()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="h-fit overflow-y-auto pl-4">
      <div className="flex h-fit">
        <Separator className='h-full' orientation="vertical" />
        <div className="flex-1 pl-4">
          <h2 className="text-xl font-semibold mb-4">{dict?.docSidebar?.title}</h2>
          <div className="space-y-2">
            {sections.map((section) => (
              <CustomLink
                key={section.id}
                href={'/' + `#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                className={cn(
                  'block px-3 py-2 text-sm rounded-md transition-colors',
                  activeSection === section.id
                    ? 'bg-neutral-100 text-black font-medium'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                )}
              >
                {section.title}
              </CustomLink>
            ))}
            <p className='text-sm text-neutral-600 px-3 py-2 flex items-center gap-1 flex-wrap'>
              <EditIcon className='w-4 h-4 mr-1' />
              {dict?.docSidebar?.description} <Link href='https://github.com/namecoder1/videatly' className='text-blue-500 hover:text-blue-600'>GitHub</Link>
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
} 