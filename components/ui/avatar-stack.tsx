import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { StaticImageData } from 'next/image'
interface AvatarData {
	src: StaticImageData
	fallback: string
	bg: string
}

interface AvatarStackProps {
	avatars: AvatarData[]
}

const AvatarStack = ({ avatars }: AvatarStackProps) => {
	return (
		<div className="flex -space-x-3">
			{avatars.map((avatar, index) => (
				<Avatar 
					key={index} 
					className="cursor-default border-2 border-border relative hover:-translate-y-0.5 duration-300 transition-transform"
				>
					<AvatarImage src={avatar.src.src} />
					<AvatarFallback className={`${avatar.bg}`}>{avatar.fallback}</AvatarFallback>
				</Avatar>
			))}
		</div>
	)
}

export default AvatarStack