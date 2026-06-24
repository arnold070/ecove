import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 animate-pulse" aria-hidden="true">
          <Image src="/images/ecove-logo.png" alt="Ecove" fill className="object-contain" priority />
        </div>
        <p className="mt-3 text-xl font-extrabold text-orange-500" aria-hidden="true">
          eco<span className="text-gray-800">ve</span>
        </p>
        <div className="mt-3 flex gap-1.5 justify-center" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  )
}
