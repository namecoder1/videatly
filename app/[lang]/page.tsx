'use client'

import Faq from "@/components/blocks/faq";
import Features from "@/components/blocks/features";
import Hero from "@/components/blocks/hero";
import HowBlock from "@/components/blocks/how-block";
import loginImage from "@/assets/docs-image/login.png"
import Addons from "@/components/blocks/addons";
import { useDictionary } from "../context/dictionary-context";
import Cta from "@/components/blocks/cta";

export default function Home() {
  const dict = useDictionary()

  return (
    <main className="min-h-screen">
      <Hero creators={12} dict={dict} seatsLeft={10} />
      
      <Features dict={dict} />

      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium tracking-wide text-sm mb-4">
              How It Works
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl max-w-2xl mx-auto font-raleway">
              All you need for your video production
            </h2>
          </div>
          
          <div className="flex flex-col gap-32">
            <HowBlock
              key={0}
              props={{
                image: loginImage,
                title: dict.landing.howSteps[0].title,
                description: dict.landing.howSteps[0].description,
                pre: dict.landing.howSteps[0].span,
                features: dict.landing.howSteps[0].fields
              }}
            />
            <HowBlock
              key={1}
              props={{
                image: loginImage,
                title: dict.landing.howSteps[1].title,
                description: dict.landing.howSteps[1].description,
                pre: dict.landing.howSteps[1].span,
                features: dict.landing.howSteps[1].fields
              }}
            />
          </div>
        </div>
      </section>

      <Addons />
      <Faq dict={dict} />


      <Cta />
      
    </main>
  );
}
