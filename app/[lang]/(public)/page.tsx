import Faq from "@/components/blocks/(public)/faq";
import Pricing from "@/components/blocks/(public)/pricing";
import Hero from "@/components/blocks/(public)/hero";
import { createClient } from "@/utils/supabase/server";
import { Rocket, ScrollText, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries";


export default async function Home({ params : { lang } }: { params: { lang: string } }) {
  const dict = await getDictionary(lang)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div>
      <Hero creators={12} dict={dict} />
      <section className="my-40 w-full px-4 py-40 space-y-24 bg-black" id="features">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-primary font-semibold tracking-wide uppercase">{dict.features.title}</span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            {dict.features.subtitle}
          </h2>
          <p className="text-xl text-muted-foreground">
            {dict.features.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-10 xl:mx-auto">
          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{dict.features.aiMagic}</h3>
            <p className="text-muted-foreground">
              {dict.features.aiMagicDescription}
            </p>
          </div>

          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{dict.features.aiScripts}</h3>
            <p className="text-muted-foreground">
              {dict.features.aiScriptsDescription}
            </p>
          </div>

          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Rocket className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{dict.features.skyrocketGrow}</h3>
            <p className="text-muted-foreground">
              {dict.features.skyrocketGrowDescription}
            </p>
          </div>
        </div>
      </section>


      <Pricing dict={dict} />

			<Faq dict={dict} />
    </div>
  );
}
