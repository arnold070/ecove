'use client'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon = '📭', title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>}
      {(action || secondaryAction) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#f68b1f' }}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#f68b1f' }}
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export function CartEmptyState() {
  return (
    <EmptyState
      icon="🛒"
      title="Your cart is empty"
      description="Browse our marketplace and add products to your cart to get started."
      action={{ label: 'Start Shopping', href: '/' }}
      secondaryAction={{ label: 'View Flash Sales', href: '/search?flashSale=true' }}
    />
  )
}

export function OrdersEmptyState() {
  return (
    <EmptyState
      icon="📦"
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping and your orders will appear here."
      action={{ label: 'Shop Now', href: '/' }}
    />
  )
}

export function ProductsEmptyState() {
  return (
    <EmptyState
      icon="🛍️"
      title="No products found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={{ label: 'Clear Filters', href: '/search' }}
    />
  )
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon="🔍"
      title={query ? `No results for "${query}"` : 'No products found'}
      description="Try different keywords, check for typos, or browse by category."
      action={{ label: 'Browse Categories', href: '/search' }}
    />
  )
}

export function WishlistEmptyState() {
  return (
    <EmptyState
      icon="♡"
      title="Your wishlist is empty"
      description="Save products you love by tapping the heart icon on any product."
      action={{ label: 'Discover Products', href: '/search' }}
    />
  )
}
