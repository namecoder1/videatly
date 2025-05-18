'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


const Breadcrumbs = ({ breadcrumbs, className }: { breadcrumbs: { label: string; href: string }[], className?: string }) => {
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';
	
	return (
		<Breadcrumb className={cn(className)}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={`/${currentLang}${breadcrumbs[0].href}`}>{breadcrumbs[0].label}</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={`/${currentLang}${breadcrumbs[1].href}`}>{breadcrumbs[1].label}</BreadcrumbLink>
				</BreadcrumbItem>
				{breadcrumbs.length > 2 && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{breadcrumbs[2].label}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export default Breadcrumbs