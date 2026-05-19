export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-tm-border border-t-tm-accent`} />
      {text && <p className="text-tm-muted text-sm">{text}</p>}
    </div>
  )
}
