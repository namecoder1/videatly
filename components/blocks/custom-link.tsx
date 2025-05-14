'use client'
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

const CustomLink = ({ href, children, className, onClick, ...props }: { href: string, children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void, props?: React.ComponentProps<typeof Link> }) => {
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';

  return (
    <Link href={`/${currentLang}${href}`} className={cn(className)} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}

export default CustomLink