import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProfileData } from "@/types/types"
import { Check, ExternalLink, Loader2 } from "lucide-react"




const PlanCard = ({ 
  name, 
  price, 
  description, 
  features, 
  action, 
  period, 
  onCheckout, 
  loading, 
  userData, 
  handleManageSubscription, 
  handleFreeDowngrade,
  isRenewed }: { 
    name: string, 
    price: number, 
    description: string, 
    features: string[], 
    action: string, 
    period: string, 
    onCheckout?: () => void, 
    loading?: boolean, 
    userData: ProfileData | null, 
    handleManageSubscription: () => void, 
    handleFreeDowngrade: () => void,
    isRenewed: boolean
  }) => {
  const getButtonText = () => {
    if (action === 'Current Plan') return 'Current Plan'
    if (name.toLowerCase() === 'free' && userData && (userData.subscription === 'pro' || userData.subscription === 'ultra')) return 'Downgrade'
    if (userData?.pending_subscription?.toLowerCase() === name.toLowerCase()) return 'Active Next Month'
    return action
  }

  const handleClick = () => {
    if (userData?.pending_subscription?.toLowerCase() === name.toLowerCase()) return
    if (name.toLowerCase() === 'free' && (userData?.subscription === 'pro' || userData?.subscription === 'ultra')) {
      handleFreeDowngrade()
      return
    }
    if (userData && userData.subscription === 'pro' && name.toLowerCase() === 'ultra') {
      handleManageSubscription()
      return
    }
    if (onCheckout) onCheckout()
  }

  const isCurrentPlan = action === 'Current Plan'
  const isUpgrade = action === 'Upgrade'
  const isDowngrade = action === 'Downgrade'
  const isPendingSubscription = userData?.pending_subscription?.toLowerCase() === name.toLowerCase()

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 group ${
      isCurrentPlan ? 'border-primary/20 bg-primary/5' : 'shadow-sm'
    }`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col items-start justify-between">
            <h3 className="text-xl font-semibold flex justify-between items-center w-full">
              {name} {!isRenewed && name === 'Free' && <span className="text-xs text-muted-foreground">Next Plan</span>}
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{price}</span>
              <span className="text-sm text-muted-foreground ml-1">/{period}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <Button
          type='button'
          variant={isCurrentPlan ? 'outline' : isUpgrade ? 'default' : 'secondary'}
          className={`w-full transition-all duration-200 ${
            isCurrentPlan 
              ? 'border-primary/20 text-primary hover:bg-primary/5' 
              : isUpgrade 
                ? 'bg-primary group-hover:bg-primary/90' 
                : 'bg-secondary group-hover:bg-secondary/90'
          }`}
          size="lg"
          onClick={handleClick}
          disabled={loading || isCurrentPlan || isPendingSubscription}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {getButtonText()}
              {isUpgrade && !isPendingSubscription && <ExternalLink className="w-4 h-4" />}
            </div>
          )}
        </Button>
      </div>
    </Card>
  )
}



export default PlanCard