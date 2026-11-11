import { Button, type ButtonProps } from '@/components/admin/Button'

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
}

/** Conservé pour les écrans existants : `Button` accepte déjà `isLoading`. */
export function LoadingButton({ children, isLoading, ...props }: LoadingButtonProps) {
  return (
    <Button isLoading={isLoading} {...props}>
      {children}
    </Button>
  )
}
