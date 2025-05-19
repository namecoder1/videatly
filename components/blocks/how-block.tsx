import { Check } from 'lucide-react'
import Image, { StaticImageData } from 'next/image'
import React from 'react'

type HowBlockProps = {
  image: StaticImageData
  title: string
  description: string
  pre: string
  features: string[]
}

const HowBlock = ({ props } : { props: HowBlockProps }) => {
  const { image, title, description, pre, features } = props

  return (
    <div className='flex flex-col md:flex-row gap-12 max-w-7xl mx-auto px-4'>
      <div className='flex flex-col gap-6 w-full md:w-1/2'>
        <hgroup className='space-y-4'>
          <span className='inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium tracking-wide text-sm capitalize'>
            {pre}
          </span>
          <h2 className='text-4xl font-bold font-raleway leading-tight tracking-tight'>{title}</h2>
        </hgroup>
        <p className='text-gray-600 leading-relaxed text-lg'>{description}</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
          {features.map((feature, index) => (
            <p key={index} className='flex items-center gap-3 text-gray-700'>
              <span className='flex-shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center'>
                <Check className='size-4 text-primary' />
              </span>
              {feature}
            </p>
          ))}
        </div>
      </div>
      <div className='w-full md:w-1/2 relative group'>
        <div className='absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000'></div>
        <Image 
          src={image} 
          alt={title} 
          width={600} 
          height={600} 
          className='relative w-full h-full object-cover rounded-2xl border border-gray-200 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]'
        />
      </div>
    </div>
  )
}

export default HowBlock