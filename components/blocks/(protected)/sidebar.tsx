import { 
  BarChart,
   Calendar, 
   Lightbulb, 
   NotepadText, 
   Book, 
   LayoutDashboard, 
   ShoppingCart, 
   CirclePlus, 
   ListOrdered, 
   ChevronRight,
   Clapperboard
  } from 'lucide-react'
import React, { useEffect } from 'react'
import { AppSidebar } from '../app-sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTokens } from '@/hooks/use-tokens'
import { createClient } from '@/utils/supabase/client'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { useDictionary } from '@/app/context/dictionary-context'



const ProtectedSidebar = () => {
	const pathname = usePathname();
	const { tokens, setTokens } = useTokens()
  const supabase = createClient()
  const dict = useDictionary()
  
  // Estrai la lingua corrente dal pathname
  const currentLang = pathname.split('/')[1] || 'en';

  const manageItems = [
    {
      label: dict.mainSidebar.manage.label1,
      href: `/${currentLang}/dashboard`,
      icon: LayoutDashboard 
    },
    {
      label: dict.mainSidebar.manage.label2, 
      href: `/${currentLang}/analytics`,
      icon: BarChart
    },
    {
      label: dict.mainSidebar.manage.label3,
      href: `/${currentLang}/calendar`,
      icon: Calendar
    }
  ]
  
  const createItems = [
    {
      label: dict.mainSidebar.create.label1[0],
      href: `/${currentLang}/ideas`,
      icon: Lightbulb,
      submenu: [
        {
          label: dict.mainSidebar.create.label1[1],
          href: `/${currentLang}/ideas/create`,
          icon: CirclePlus
        },
        {
          label: dict.mainSidebar.create.label1[2],
          href: `/${currentLang}/ideas`,
          icon: ListOrdered
        }
      ]
    },
    {
      label: dict.mainSidebar.create.label2, 
      href: `/${currentLang}/scripts`,
      icon: NotepadText
    },
    {
      label: dict.mainSidebar.create.label3, 
      href: `/${currentLang}/production`,
      icon: Clapperboard
    },
  ]
  
  const settingsItems = [
    {
      label: dict.mainSidebar.settings.label1,
      href: `/${currentLang}/shop`,
      icon: ShoppingCart,
    },
    {
      label: dict.mainSidebar.settings.label2,
      href: `/${currentLang}/documentation`,
      icon: Book,
    }
  ]

  useEffect(() => {
    const fetchTokens = async () => {
      const { data, error } = await supabase.from('tokens').select('base_tokens, paid_tokens, tool')
      if (error) {
        console.error('Error fetching tokens:', error)
        return
      }
      
      if (data) {
        setTokens(data)
      }
    }

    if (!tokens.length) {
      fetchTokens()
    }
  }, [supabase, setTokens, tokens.length])
	
	return (
		<AppSidebar isProtected={true} dict={dict}>
			      
				<SidebarGroup>
          <SidebarGroupLabel>
            {dict.mainSidebar.manage.title}
          </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {manageItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        {<item.icon />} {/* Wrap in curly braces to render component */}
                        <p>{item.label}</p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>
            {dict.mainSidebar.create.title}
          </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {createItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + '/')}>
                      <Link href={item.href}>
                        {<item.icon />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.submenu && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <ChevronRight />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className='rounded-2xl'>
                        {item.submenu?.map((subItem) => (
                          <DropdownMenuItem key={subItem.label}>
                            <Link href={subItem.href} className='flex items-center gap-2'>
                              {<subItem.icon className='w-4 h-4' />}
                              <span>{subItem.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>
            {dict.mainSidebar.settings.title}
          </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + '/')}>
                      <Link href={item.href}>
                        {<item.icon />} {/* Wrap in curly braces to render component */}
                        <p>{item.label}</p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      
		</AppSidebar>
	)
}

export default ProtectedSidebar




