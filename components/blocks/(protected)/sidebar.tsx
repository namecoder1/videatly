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
   MoreHorizontal, 
   ChevronRight,
   ListCollapse
  } from 'lucide-react'
import React from 'react'
import { AppSidebar } from '../app-sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

const manageItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard 
  },
  {
    label: "Analytics", 
    href: "/analytics",
    icon: BarChart
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar
  }
]

const createItems = [
  {
    label: "Ideas",
    href: "/ideas",
    icon: Lightbulb,
    submenu: [
      {
        label: 'Create Idea',
        href: '/ideas/create',
        icon: CirclePlus
      },
      {
        label: 'Your Ideas',
        href: '/ideas',
        icon: ListOrdered
      }
    ]
  },
  {
    label: "Scripts", 
    href: "/scripts",
    icon: NotepadText,
    submenu: [
      {
        label: 'Create Script',
        href: '/scripts/create',
        icon: CirclePlus
      },
      {
        label: 'Your Scripts',
        href: '/scripts',
        icon: ListCollapse
      }
    ]
  },
]

const settingsItems = [
  {
    label: "Shop",
    href: "/shop",
    icon: ShoppingCart,
  },
  {
    label: "Docs",
    href: "/documentation",
    icon: Book,
  }
]

const ProtectedSidebar = () => {
	const pathname = usePathname();
	
	return (
		<AppSidebar isProtected={true}>
			      
				<SidebarGroup>
          <SidebarGroupLabel>
            Manage
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
            Create
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
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>
            Various
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




