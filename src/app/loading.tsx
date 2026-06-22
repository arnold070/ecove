export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="text-4xl font-extrabold animate-pulse" style={{ color: '#f68b1f' }} aria-hidden="true">ecove</div>
        <div className="mt-3 flex gap-1 justify-center" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#f68b1f', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  )
}
