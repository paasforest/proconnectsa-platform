import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size])} />
    </div>
  )
}
