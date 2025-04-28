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
import { LogOut } from "lucide-react"
import Image from "next/image"
import logo from '@/assets/logo.png'
import Link from "next/link"
import { Separator } from "../ui/separator"
import TokenViewer from './(protected)/tokens-viewer'
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from 'react'


export const AppSidebar = ({ children, isProtected, ...props } : { 
  children: React.ReactNode,
  isProtected: boolean,
  props?: React.ComponentProps<typeof Sidebar>
}) => {

  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [tokens, setTokens] = useState<any>("0")
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: tokensData, error } = await supabase
          .from('tokens')
          .select('base_tokens, paid_tokens, tool')  // Aggiungiamo 'tool' alla select
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error fetching tokens:', error)
        } else if (tokensData) {
          setTokens(tokensData)
        }
      }
    }
    
    fetchUser()
  }, [supabase])
  
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <Link href="/">
          <Image src={logo} alt="Logo" width={80} height={80} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {children}
      </SidebarContent>
      <SidebarFooter>
        {isProtected && user ? (
          <>
            <TokenViewer tokens={tokens} />
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
            <Image src={googleLogo} alt="google logo" width={20} height={20} />
            Log In
          </Button>
        </form>
      )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
