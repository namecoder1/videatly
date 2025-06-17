import { Rocket, ScrollText, Sparkles } from 'lucide-react'
import React from 'react'

const Features = ({ dict }: { dict: any }) => {
  return (
    <section className="w-full px-4 py-32 space-y-20 bg-gradient-to-b from-black to-gray-900" id="use-cases">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium tracking-wide text-sm">
          {dict.features.title} 
        </span>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white font-raleway leading-tight">
          {dict.features.subtitle}
        </h2>
        <p className="text-xl text-gray-400 font-nunito max-w-2xl mx-auto">
          {dict.features.description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-10 xl:mx-auto">
        <div className="group space-y-6 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold font-raleway tracking-tight text-white">{dict.features.aiMagic}</h3>
          <p className="text-gray-400 leading-relaxed">
            {dict.features.aiMagicDescription}
          </p>
        </div>

        <div className="group space-y-6 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ScrollText className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold font-raleway tracking-tight text-white">{dict.features.aiScripts}</h3>
          <p className="text-gray-400 leading-relaxed">
            {dict.features.aiScriptsDescription}
          </p>
        </div>

        <div className="group space-y-6 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Rocket className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold font-raleway tracking-tight text-white">{dict.features.skyrocketGrow}</h3>
          <p className="text-gray-400 leading-relaxed">
            {dict.features.skyrocketGrowDescription}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Features