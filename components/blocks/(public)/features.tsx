import { Rocket, Sparkles } from 'lucide-react'
import { ScrollText } from 'lucide-react'
import React from 'react'

const Features = () => {
  return (
    <section className="my-40 w-full px-4 py-40 space-y-24 bg-black" id="features">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="text-primary font-semibold tracking-wide uppercase">Features</span>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          What makes Videatly different?
        </h2>
        <p className="text-xl text-muted-foreground">
          Stop wasting time with brainstorming. Start creating content that captivates your audience and grows your channel automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-10 xl:mx-auto">
        <div className="space-y-6 p-8 rounded-2xl bg-white border">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">AI-powered content</h3>
          <p className="text-muted-foreground">
            Generate unlimited creativity with AI. Create perfect video ideas for your audience and preferences.
          </p>
        </div>

        <div className="space-y-6 p-8 rounded-2xl bg-white border">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ScrollText className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Craft viral scripts</h3>
          <p className="text-muted-foreground">
            Transform ideas into engaging stories instantly. Our AI creates captivating scripts that keep viewers glued to the screen.
          </p>
        </div>

        <div className="space-y-6 p-8 rounded-2xl bg-white border">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Rocket className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Skyrocket growth</h3>
          <p className="text-muted-foreground">
            Grow 10x faster. What used to take days now happens in minutes with our AI.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Features