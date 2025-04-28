import Faq from "@/components/blocks/(public)/faq";
import Pricing from "@/components/blocks/(public)/pricing";
import Hero from "@/components/blocks/(public)/hero";
import { createClient } from "@/utils/supabase/server";
import { Rocket, ScrollText, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div>
      <Hero creators={45} />
      <section className="my-40 w-full px-4 py-40 space-y-24 bg-black" id="features">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-primary font-semibold tracking-wide uppercase">Why Choose Videatly?</span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Your Secret Weapon for Viral Content
          </h2>
          <p className="text-xl text-muted-foreground">
            Stop wasting time brainstorming. Start creating content that captivates your audience and grows your channel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-10 xl:mx-auto">
          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">AI Content Magic</h3>
            <p className="text-muted-foreground">
              Unleash endless creativity with our AI. Generate viral-worthy video ideas perfectly matched to your style and audience preferences.
            </p>
          </div>

          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Captivating Scripts</h3>
            <p className="text-muted-foreground">
              Turn ideas into engaging narratives instantly. Our AI crafts compelling scripts that keep viewers glued to their screens.
            </p>
          </div>

          <div className="space-y-6 p-8 rounded-2xl bg-white border">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Rocket className="size-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Skyrocket Growth</h3>
            <p className="text-muted-foreground">
              Scale your content creation 10x faster. What used to take days now happens in minutes with our intelligent automation.
            </p>
          </div>
        </div>
      </section>


      <Pricing />

			<Faq />
    </div>
  );
}
