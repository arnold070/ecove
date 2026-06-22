import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Ecove – Nigeria's Online Marketplace"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f68b1f 0%, #e67000 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: '#f68b1f',
            }}
          >
            E
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-2px',
            }}
          >
            Ecove
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.92)',
            margin: 0,
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Nigeria&apos;s Online Marketplace
        </p>
        <p
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          Shop Smart · Live Better · ecove.com.ng
        </p>
      </div>
    ),
    { ...size },
  )
}
