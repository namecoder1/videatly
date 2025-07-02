"use client";

import React, { useState, useEffect } from "react";
import CustomIcon from "@/components/ui/custom-icon";
import { LightbulbIcon, ShoppingCartIcon, VideoIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/blocks/loader";
import { useDictionary } from "@/app/context/dictionary-context";

interface PriceIds {
  basicIdeaBucket: string;
  standardIdeaBucket: string;
  premiumIdeaBucket: string;
  basicScriptBucket: string;
  standardScriptBucket: string;
  premiumScriptBucket: string;
}

const ShopPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [priceIds, setPriceIds] = useState<PriceIds | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dict = useDictionary();

  // Fetch price IDs from API
  useEffect(() => {
    const fetchPriceIds = async () => {
      try {
        console.log("Fetching price IDs from API...");
        const response = await fetch("/api/stripe/get-price-ids");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch price IDs`);
        }
        const data = await response.json();
        console.log("Price IDs received:", data);

        // Check if we received an error from the API
        if (data.error) {
          throw new Error(data.details || data.error);
        }

        setPriceIds(data);
      } catch (err) {
        console.error("Error fetching price IDs:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load price configuration"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceIds();
  }, []);

  const ideaTokensPlans = priceIds
    ? [
        {
          name: dict?.shopPage?.ideaTokens?.fields[0]?.title || "Basic",
          price: 9.99,
          description:
            dict?.shopPage?.ideaTokens?.fields[0]?.description ||
            "For starters",
          tokens: 2500,
          tool: "ideas",
          isPopular: false,
          priceId: priceIds.basicIdeaBucket,
        },
        {
          name: dict?.shopPage?.ideaTokens?.fields[1]?.title || "Standard",
          price: 19.99,
          description:
            dict?.shopPage?.ideaTokens?.fields[1]?.description ||
            "For regular creators",
          tokens: 5000,
          tool: "ideas",
          isPopular: true,
          priceId: priceIds.standardIdeaBucket,
        },
        {
          name: dict?.shopPage?.ideaTokens?.fields[2]?.title || "Premium",
          price: 34.99,
          description:
            dict?.shopPage?.ideaTokens?.fields[2]?.description ||
            "For power users",
          tokens: 25000,
          tool: "ideas",
          isPopular: false,
          priceId: priceIds.premiumIdeaBucket,
        },
      ]
    : [];

  const scriptTokensPlans = priceIds
    ? [
        {
          name: dict?.shopPage?.scriptTokens?.fields[0]?.title || "Basic",
          price: 14.99,
          description:
            dict?.shopPage?.scriptTokens?.fields[0]?.description ||
            "For beginners",
          tokens: 5000,
          tool: "scripts",
          isPopular: false,
          priceId: priceIds.basicScriptBucket,
        },
        {
          name: dict?.shopPage?.scriptTokens?.fields[1]?.title || "Standard",
          price: 39.99,
          description:
            dict?.shopPage?.scriptTokens?.fields[1]?.description ||
            "For content creators",
          tokens: 15000,
          tool: "scripts",
          isPopular: true,
          priceId: priceIds.standardScriptBucket,
        },
        {
          name: dict?.shopPage?.scriptTokens?.fields[2]?.title || "Premium",
          price: 69.99,
          description:
            dict?.shopPage?.scriptTokens?.fields[2]?.description ||
            "For professional users",
          tokens: 50000,
          tool: "scripts",
          isPopular: false,
          priceId: priceIds.premiumScriptBucket,
        },
      ]
    : [];

  const PlanCard = ({ plan }: { plan: (typeof ideaTokensPlans)[0] }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleCheckout = async () => {
      setIsLoading(true);
      try {
        // Validation: verifica che tutti i dati necessari siano presenti
        if (!plan.priceId || plan.priceId.trim() === "") {
          console.error("Missing or empty priceId:", {
            planName: plan.name,
            priceId: plan.priceId,
            tool: plan.tool,
          });
          throw new Error(
            "Price ID mancante. Verifica la configurazione Stripe in produzione."
          );
        }

        console.log("Checkout data:", {
          planName: plan.name,
          price: plan.price,
          priceId: plan.priceId,
          tokens: plan.tokens,
          tool: plan.tool,
        });

        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: plan.priceId,
            tokens: plan.tokens,
            tool: plan.tool,
          }),
        });

        console.log("Response status:", res.status);
        const responseData = await res.json();
        console.log("Response data:", responseData);

        if (!res.ok) {
          throw new Error(
            responseData.error || `HTTP ${res.status}: Errore API`
          );
        }

        const { url, error } = responseData;
        if (url) {
          window.location.href = url;
        } else {
          throw new Error(
            error || "Errore nella creazione della sessione Stripe"
          );
        }
      } catch (error) {
        setIsError(true);
        console.error("Checkout error:", error);
        toast({
          title: dict?.shopPage?.toast?.purchaseError?.title || "Error",
          description:
            error instanceof Error
              ? error.message
              : dict?.shopPage?.toast?.purchaseError?.description ||
                "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div
        className={`rounded-3xl border bg-white p-6 flex flex-col h-fit ${plan.isPopular ? "relative shadow-xl ring-2 ring-gray-700/70" : "shadow-lg hover:shadow-xl transition-shadow"}`}
      >
        {plan.isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
              {dict?.pricing?.popular || "Most Popular"}
            </span>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold tracking-tight">
              {dict?.currency}
              {plan.price}
            </span>
          </div>
          <p className="text-zinc-600 mt-3">{plan.description}</p>
        </div>

        <p className="flex items-center gap-3 text-zinc-700 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-green-500 flex-shrink-0"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{plan.tokens} tokens</span>
        </p>

        <Button
          className="w-full py-5 text-base font-medium relative"
          variant={plan.isPopular ? "default" : "outline"}
          size="lg"
          disabled={isLoading || !plan.priceId || plan.priceId.trim() === ""}
          onClick={handleCheckout}
        >
          {isLoading ? (
            isLoading && plan.isPopular ? (
              <div className="flex items-center justify-center">
                <Loader position="center" color="white" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Loader position="center" />
              </div>
            )
          ) : !plan.priceId || plan.priceId.trim() === "" ? (
            "Price ID non configurato"
          ) : (
            `${dict?.shopPage?.button}${dict?.currency}${plan.price}`
          )}
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <Loader position="full" />;
  }

  if (error) {
    return (
      <section>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <CustomIcon icon={<ShoppingCartIcon />} color="red" />
            <h1 className="text-3xl font-bold tracking-tight">
              {dict?.shopPage?.title || "Shop"}
            </h1>
          </div>
          <Separator className="my-4" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Errore di configurazione Stripe
          </h2>
          <p className="text-gray-600 max-w-md mb-4">{error}</p>

          {error.includes("Missing price IDs") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg">
              <p className="text-sm text-yellow-800">
                <strong>Per gli sviluppatori:</strong> I Price ID di Stripe non
                sono configurati in produzione. Consulta{" "}
                <code>STRIPE_PRODUCTION_SETUP.md</code> per le istruzioni
                complete.
              </p>
            </div>
          )}

          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Riprova
          </Button>
        </div>
      </section>
    );
  }

  if (!priceIds) {
    return (
      <section>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <CustomIcon icon={<ShoppingCartIcon />} color="red" />
            <h1 className="text-3xl font-bold tracking-tight">
              {dict?.shopPage?.title || "Shop"}
            </h1>
          </div>
          <Separator className="my-4" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Prezzi non disponibili
          </h2>
          <p className="text-gray-500">
            I prezzi non sono attualmente disponibili. Riprova più tardi.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <CustomIcon icon={<ShoppingCartIcon />} color="red" />
          <h1 className="text-3xl font-bold tracking-tight">
            {dict?.shopPage?.title || "Shop"}
          </h1>
        </div>
        <Separator className="my-4" />
      </div>

      <div className="flex flex-col gap-10 w-full my-4">
        {/* Idea Tokens Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <CustomIcon icon={<LightbulbIcon />} color="orange" />
            {dict?.shopPage?.ideaTokens?.title || "Idea Tokens"}
          </h2>
          <p className="text-zinc-600 max-w-2xl">
            {dict?.shopPage?.ideaTokens?.description ||
              "Generate unique ideas for your next project or creative endeavor."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideaTokensPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* YouTube Script Tokens Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <CustomIcon icon={<VideoIcon />} color="blue" />
            {dict?.shopPage?.scriptTokens?.title || "YouTube Script Tokens"}
          </h2>
          <p className="text-zinc-600 max-w-2xl">
            {dict?.shopPage?.scriptTokens?.description ||
              "Create engaging scripts for your YouTube videos to boost viewer engagement."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scriptTokensPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopPage;
