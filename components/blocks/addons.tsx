import { ArrowRight, BarChart3, Clock, Zap } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

const Addons = ({ dict }: { dict: any }) => {
  const addons = [
    {
      icon: <Zap className="size-5 text-primary" />,
      title: dict.landing.addons.features[0].title,
      description: dict.landing.addons.features[0].description
    },
    {
      icon: <Clock className="size-5 text-primary" />,
      title: dict.landing.addons.features[1].title,
      description: dict.landing.addons.features[1].description
    },
    {
      icon: <BarChart3 className="size-5 text-primary" />,
      title: dict.landing.addons.features[2].title,
      description: dict.landing.addons.features[2].description
    }
  ]

  return (
    <section className="w-full py-32 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium tracking-wide text-sm mb-4">
            {dict.landing.addons.subtitle}
          </span>
          <h2 className="text-4xl font-bold font-raleway tracking-tight mb-4">
            {dict.landing.addons.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {dict.landing.addons.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {addons.map((addon, index) => (
            <Card key={index} className="group hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {addon.icon}
                </div>
                <CardTitle className="text-xl font-bold font-raleway">{addon.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {addon.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="group-hover:text-primary p-0 h-auto">
                  {dict.landing.addons.button}
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Addons