"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProfileData, PaymentWithMetadata } from "@/types/types";
import CustomIcon from "@/components/ui/custom-icon";
import {
  Clock,
  Loader2,
  OctagonX,
  Settings2,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader } from "@/components/ui/card";
import Loader from "@/components/blocks/loader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDictionary } from "@/app/context/dictionary-context";
import { createStripeCheckoutSession } from "@/utils/stripe/createCheckoutSession";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import PlanCard from "@/components/blocks/(protected)/plan-card";
import { calculateSubscriptionProgress, getPlanLabel } from "@/lib/utils";

interface PriceIds {
  basicIdeaBucket: string;
  standardIdeaBucket: string;
  premiumIdeaBucket: string;
  basicScriptBucket: string;
  standardScriptBucket: string;
  premiumScriptBucket: string;
  proPlan: string;
  ultraPlan: string;
}

const BillingPage = () => {
  const dict = useDictionary();
  const [payments, setPayments] = useState<PaymentWithMetadata[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [priceIds, setPriceIds] = useState<PriceIds | null>(null);
  const [priceIdsError, setPriceIdsError] = useState<string | null>(null);
  const router = useRouter();

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
        setPriceIds(data);
      } catch (err) {
        console.error("Error fetching price IDs:", err);
        setPriceIdsError(
          err instanceof Error
            ? err.message
            : "Failed to load price configuration"
        );
      }
    };

    fetchPriceIds();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User not found:", userError);
          setError("User not found");
          setLoading(false);
          return;
        }
        setUser(user);

        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          setError("Error fetching user data");
          setLoading(false);
          return;
        }

        setUserData(userData);

        // Recupera le notifiche di pagamento fallito
        const { data: notifications, error: notificationsError } =
          await supabase
            .from("notifications")
            .select("*")
            .eq("auth_user_id", user.id)
            .eq("type", "payment_failed")
            .eq("read", false)
            .order("created_at", { ascending: false })
            .limit(1);

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
        } else if (notifications && notifications.length > 0) {
          setCheckoutError(
            "Your last payment failed. Please update your payment method to continue using the service."
          );
        }

        const { data: payments, error: paymentsError } = await supabase
          .from("invoices")
          .select("*")
          .eq("auth_user_id", user.id);

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          setError("Error fetching payments");
          setLoading(false);
          return;
        }

        setPayments(payments);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePlanChange = async (targetPlan: "free" | "pro" | "ultra") => {
    if (!userData?.auth_user_id) {
      setCheckoutError("User ID non disponibile. Riprova dopo il login.");
      return;
    }

    if (!priceIds) {
      setCheckoutError(
        "Price configuration not loaded. Please refresh the page and try again."
      );
      return;
    }

    setLoadingPlan(targetPlan);
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const supabase = createClient();

      // if user is on pro and wants to upgrade to ultra
      if (userData.subscription === "pro" && targetPlan === "ultra") {
        if (!priceIds.ultraPlan) {
          throw new Error("Ultra plan price ID not configured");
        }
        // create a checkout session to upgrade to ultra
        const url = await createStripeCheckoutSession({
          userId: userData.auth_user_id,
          priceId: priceIds.ultraPlan,
          plan: "ultra",
        });
        window.location.href = url;
        return;
      }

      // Downgrade o altri cambi piano
      if (
        // if the user is on ultra/pro and wants to downgrade to pro/free
        (userData.subscription === "ultra" &&
          ["pro", "free"].includes(targetPlan)) ||
        (userData.subscription === "pro" && targetPlan === "free")
      ) {
        // create a portal session to manage the subscription
        const response = await fetch("/api/stripe/create-portal-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.auth_user_id }),
        });
        // redirect to the portal session
        const data = await response.json();
        window.location.href = data.url;
        return;
      }

      // if user is on free and wants to upgrade to pro/ultra
      if (
        userData.subscription === "free" &&
        ["pro", "ultra"].includes(targetPlan)
      ) {
        const targetPriceId =
          targetPlan === "pro" ? priceIds.proPlan : priceIds.ultraPlan;
        if (!targetPriceId) {
          throw new Error(`${targetPlan} plan price ID not configured`);
        }
        // create a checkout session to upgrade to pro/ultra
        const url = await createStripeCheckoutSession({
          userId: userData.auth_user_id,
          priceId: targetPriceId,
          plan: targetPlan,
        });
        window.location.href = url;
        return;
      }
    } catch (err: any) {
      console.error("Plan change error:", err);
      setCheckoutError(
        err.message || "An error occurred while changing your plan"
      );
    } finally {
      setCheckoutLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!userData?.auth_user_id) {
      setCheckoutError("User ID non disponibile. Riprova dopo il login.");
      return;
    }
    setPortalLoading(true);
    setCheckoutError(null);
    try {
      // create a portal session to manage the subscription
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.auth_user_id,
        }),
      });
      // redirect to the portal session
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Portal session error:", err);
      setCheckoutError(
        err.message || "An error occurred while accessing the customer portal"
      );
    } finally {
      setPortalLoading(false);
    }
  };

  // Funzione per downgrade a free (cancella rinnovo automatico)
  const handleFreeDowngrade = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const response = await fetch("/api/stripe/cancel-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData?.auth_user_id }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      setCheckoutError(err.message || "Errore durante il downgrade");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatSubscriptionType = (type: string) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  if (loading) {
    return <Loader position="full" />;
  }

  // Mostra messaggio di downgrade programmato

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <CustomIcon icon={<Wallet />} color="red" />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16">
            Billing
          </h1>
        </div>
        <Separator className="my-2" />
      </div>

      {checkoutError && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <p className="text-sm text-red-700">{checkoutError}</p>
          </div>
        </div>
      )}

      {priceIdsError && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Configuration Error
                </h3>
                <p className="text-sm text-orange-700 mt-1">{priceIdsError}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
                className="h-8 text-orange-800 border-orange-300 hover:bg-orange-100 transition-colors"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlanCard
          name="Free"
          price={0}
          description="For Starters"
          features={["2500 idea tokens", "5000 script tokens"]}
          action={
            userData?.subscription === "free"
              ? "Current Plan"
              : userData?.subscription === "pro" ||
                  userData?.subscription === "ultra"
                ? "Downgrade"
                : "Downgrade"
          }
          period="month"
          onCheckout={() => handlePlanChange("free")}
          loading={loadingPlan === "free"}
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
          isRenewed={userData?.subscription_renewal || false}
          disabled={!priceIds && !priceIdsError}
        />
        <PlanCard
          name="Pro"
          price={14.99}
          description="For Youtubers"
          features={["2500 idea tokens", "5000 script tokens"]}
          action={
            userData?.subscription === "pro"
              ? "Current Plan"
              : userData?.subscription === "free"
                ? "Upgrade"
                : "Downgrade"
          }
          period="month"
          onCheckout={() => handlePlanChange("pro")}
          loading={loadingPlan === "pro"}
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
          isRenewed={userData?.subscription_renewal || false}
          disabled={(!priceIds && !priceIdsError) || !priceIds?.proPlan}
        />
        <PlanCard
          name="Ultra"
          price={29.99}
          description="For Professionals"
          features={["2500 idea tokens", "5000 script tokens"]}
          action={
            userData?.subscription === "ultra" ? "Current Plan" : "Upgrade"
          }
          period="month"
          onCheckout={() => handlePlanChange("ultra")}
          loading={loadingPlan === "ultra"}
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
          isRenewed={userData?.subscription_renewal || false}
          disabled={(!priceIds && !priceIdsError) || !priceIds?.ultraPlan}
        />
      </div>

      <div className="space-y-8">
        {/* Payment Failed Alert */}
        {userData?.subscription_status === "payment_failed" && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Payment Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your last payment attempt failed. Please update your payment
                    method to continue using the service.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  size="sm"
                  className="h-8 text-red-800 border-red-300 hover:bg-red-100 transition-colors"
                >
                  {portalLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Payment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Status */}
            {userData?.subscription !== "free" ? (
              <Card className="overflow-hidden">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 border-2 border-border rounded-xl">
                      <Clock className="w-5 h-5 " />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">
                          Subscription Status
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userData?.subscription_renewal === false ? (
                            <>
                              Ends on{" "}
                              {userData?.subscription_end
                                ? new Date(
                                    userData.subscription_end
                                  ).toLocaleDateString()
                                : "N/A"}
                            </>
                          ) : (
                            <>
                              Ends in{" "}
                              {userData?.subscription_end
                                ? Math.ceil(
                                    (new Date(
                                      userData.subscription_end
                                    ).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )
                                : "N/A"}{" "}
                              days
                            </>
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {userData?.subscription_renewal === false ? (
                          <>
                            Your subscription will not be renewed at the end of
                            the current period.
                          </>
                        ) : userData?.pending_subscription &&
                          userData?.pending_subscription !==
                            userData?.subscription ? (
                          <>
                            The plan will be automatically renewed on{" "}
                            <span className="font-medium">
                              {userData?.subscription_end
                                ? new Date(
                                    userData.subscription_end
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                            . You will be{" "}
                            <span className="text-yellow-800 font-medium">
                              downgraded to the{" "}
                              {getPlanLabel(userData.pending_subscription)} plan
                            </span>{" "}
                            at the end of the current period.
                          </>
                        ) : (
                          <>
                            The plan will be automatically renewed on{" "}
                            <span className="font-medium">
                              {userData?.subscription_end
                                ? new Date(
                                    userData.subscription_end
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                            .
                          </>
                        )}
                      </p>
                      <Progress
                        value={calculateSubscriptionProgress({ userData })}
                        className="h-2 bg-gray-500/20"
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Card className="overflow-hidden border-2 border-border">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-muted rounded-xl">
                      <OctagonX className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">
                        No Active Subscription
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upgrade to a paid plan to access all features
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader className="p-6 gap-2 flex h-full flex-col justify-between">
              {userData?.subscription === "free" ? (
                <p>Each month you will be charged 0€</p>
              ) : userData?.pending_subscription &&
                userData?.pending_subscription !== userData?.subscription ? (
                <>
                  You will be{" "}
                  <b>
                    downgraded to the{" "}
                    {getPlanLabel(userData.pending_subscription || "")} plan
                  </b>{" "}
                  at the end of the current period.
                </>
              ) : (
                <p>To manage your plan click the button below.</p>
              )}
              <Button
                variant="outline"
                size="xs"
                onClick={handleManageSubscription}
                disabled={portalLoading || userData?.subscription === "free"}
                className="h-8"
              >
                <Settings2 className="w-4 h-4" />
                Manage Subscription
              </Button>
            </CardHeader>
          </Card>

          {/* Invoices Section */}
        </div>

        {/* Development Tools */}
        {/* {process.env.NODE_ENV === 'development' && userData?.subscription !== 'free' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">Test Subscription Expiration</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This button will simulate subscription expiration by setting the end date to 1 minute ago.
                    Only visible in development environment.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestExpiration({ userData, setTestLoading, router })}
                  disabled={testLoading}
                  size="sm"
                  className="h-8 text-yellow-800 border-yellow-300 hover:bg-yellow-100 transition-colors"
                >
                  {testLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Testing...</span>
                    </div>
                  ) : (
                    'Test Expiration'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )} */}
      </div>

      <div className="space-y-4 pt-6">
        <div className="flex flex-col items-start justify-between">
          <h2 className="text-lg font-bold">Recent Invoices</h2>
          <p className="text-gray-600 text-sm mt-1">
            View your recent payments and subscriptions
          </p>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-hidden ">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Invoice Url
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.slice(0, 5).map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono">
                        {payment.currency === "eur" ? "€" : ""}
                        {(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {payment.product === "ideas"
                          ? "Idea Tokens"
                          : payment.product === "scripts"
                            ? "Script Tokens"
                            : `${payment.product} Plan`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-4 py-3 text-muted-foreground hidden sm:table-cell `}
                      >
                        {payment.metadata.type?.charAt(0).toUpperCase() +
                          payment.metadata.type?.slice(1).toLowerCase()}
                      </td>
                      {payment.metadata.hosted_invoice_url ? (
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          <Link
                            href={payment.metadata.hosted_invoice_url || ""}
                            className="hover:underline underline-offset-2"
                          >
                            View invoice
                          </Link>
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          No invoice
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You have no invoices
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BillingPage;
