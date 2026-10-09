import { Loader2 } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
}

/** Bouton qui affiche un indicateur de chargement et se désactive pendant l'envoi */
export function LoadingButton({
  children,
  isLoading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(className)}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  )
}
