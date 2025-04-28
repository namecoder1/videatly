import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils";


const Breadcrumbs = ({ breadcrumbs, className }: { breadcrumbs: { label: string; href: string }[], className?: string }) => {
	return (
		<Breadcrumb className={cn(className)}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={breadcrumbs[0].href}>{breadcrumbs[0].label}</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={breadcrumbs[1].href}>{breadcrumbs[1].label}</BreadcrumbLink>
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