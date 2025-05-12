"use client"

import googleLogo from '@/assets/google-icon.png'
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { logOut, signInWithGoogleAction } from "@/app/(authentication)/actions"
import { Button } from "../ui/button"
import UserInfo from "./user-info"
import { LogInIcon, LogOut } from "lucide-react"
import Image from "next/image"
import logo from '@/assets/logo.png'
import Link from "next/link"
import { Separator } from "../ui/separator"
import TokenViewer from './(protected)/tokens-viewer'
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from 'react'
import { Skeleton } from "../ui/skeleton"

export const AppSidebar = ({ children, isProtected, ...props } : { 
  children: React.ReactNode,
  isProtected: boolean,
  props?: React.ComponentProps<typeof Sidebar>
}) => {

  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [tokens, setTokens] = useState<any>("0")
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single()
      setUser(userProfile)
      
      if (user) {
        const { data: tokensData, error } = await supabase
          .from('tokens')
          .select('base_tokens, paid_tokens, tool')
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error fetching tokens:', error)
        } else if (tokensData) {
          setTokens(tokensData)
        }
      }
      setIsLoading(false)
    }
    
    fetchUser()
  }, [supabase])
  
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        {user ? (
          <Link href="/dashboard">
            <Image src={logo} alt="Logo" width={80} height={80} priority />
          </Link>
        ) : (
          <Link href="/">
            <Image src={logo} alt="Logo" width={80} height={80} priority />
          </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        {children}
      </SidebarContent>
      <SidebarFooter>
        {isProtected ? (
          isLoading ? (
            <>
              <div className='rounded-3xl border border-neutral-200 bg-white p-4 flex items-center justify-between gap-2'>
                <div className='flex items-center gap-3'>
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className='flex flex-col gap-2'>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className='flex items-center gap-2.5 w-full justify-between p-2'>
                <div className='flex items-center gap-2.5'>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Separator />
              <Skeleton className="h-10 w-full rounded-3xl" />
            </>
          ) : user ? (
            <>
              <TokenViewer />
              <UserInfo />
              <Separator />
              <form>
                <Button formAction={logOut} type="submit" className="w-full">
                  <LogOut />
                  <span className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    Log Out
                  </span>
                </Button>
              </form>
            </>
          ) : (
            <form>
              <Button className='w-full bg-black text-white hover:bg-black/80' type="submit" formAction={signInWithGoogleAction}>
                <LogInIcon className='hidden group-data-[collapsible=icon]:block' />
                <Image src={googleLogo} alt="google logo" width={20} height={20} className='w-5 h-5 group-data-[collapsible=icon]:hidden' />
                <span className='flex items-center gap-2 group-data-[collapsible=icon]:hidden'>
                  Log In
                </span>
              </Button>
            </form>
          )
        ) : (
          <form>
            <Button className='w-full bg-black text-white hover:bg-black/80' type="submit" formAction={signInWithGoogleAction}>
              <LogInIcon className='hidden group-data-[collapsible=icon]:block' />
              <Image src={googleLogo} alt="google logo" width={20} height={20} className='w-5 h-5 group-data-[collapsible=icon]:hidden' />
              <span className='flex items-center gap-2 group-data-[collapsible=icon]:hidden'>
                Log In
              </span>
            </Button>
          </form>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
