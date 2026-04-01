'use client'
import React, { useState, useEffect, useRef } from 'react'

interface Banner {
  id: number
  uuid: string
  image: string
  title?: string
  description?: string
  redirectUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const AUTO_SLIDE = 5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function BannerSlider() {

  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dragStart = useRef<number | null>(null)

  // Fetch banners from backend API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/banners`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.statusText}`)
        }
        
        const result = await response.json()
        setBanners(result.data || [])
      } catch (err) {
        console.error('Error fetching banners:', err)
        setError(err instanceof Error ? err.message : 'Failed to load banners')
        // Fallback to empty array if API fails
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  const next = () => {
    if (banners.length === 0) return
    setIndex((i) => (i + 1) % banners.length)
  }

  const prev = () => {
    if (banners.length === 0) return
    setIndex((i) => (i - 1 + banners.length) % banners.length)
  }

  // Auto-slide effect
  useEffect(() => {
    if (banners.length === 0) return

    timerRef.current = setInterval(next, AUTO_SLIDE)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [banners.length])

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const diff = dragStart.current - e.clientX

    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }

    dragStart.current = null
  }

  return (
    <div className="w-full py-10 flex justify-center">
      {/* Loading state */}
      {loading && (
        <div className="w-full max-w-6xl h-[22rem] bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="w-full max-w-6xl h-[22rem] bg-red-100 rounded-2xl flex items-center justify-center">
          <div className="text-red-600">Failed to load banners</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && banners.length === 0 && (
        <div className="w-full max-w-6xl h-[22rem] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-gray-500">No banners available</div>
        </div>
      )}

      {/* Banner slider */}
      {!loading && banners.length > 0 && (
        <div
          className="relative w-full max-w-6xl h-[22rem] overflow-hidden flex items-center justify-center"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >

          {banners.map((banner, i) => {

            const position =
              i === index
                ? "center"
                : i === (index - 1 + banners.length) % banners.length
                ? "left"
                : i === (index + 1) % banners.length
                ? "right"
                : "hidden"

            return (
              <div
                key={banner.uuid}
                onClick={() => {
                  if (banner.redirectUrl) {
                    window.location.href = banner.redirectUrl
                  }
                }}
                className="absolute transition-all duration-500 cursor-pointer rounded-2xl overflow-hidden"
                style={{

                  width: position === "center" ? "75%" : "35%",
                  height: position === "center" ? "100%" : "85%",

                  transform:
                    position === "center"
                      ? "translateX(0) scale(1)"
                      : position === "left"
                      ? "translateX(-110%) scale(0.95)"
                      : position === "right"
                      ? "translateX(110%) scale(0.95)"
                      : "scale(0)",

                  opacity: position === "hidden" ? 0 : position === "center" ? 1 : 0.6,

                  zIndex: position === "center" ? 10 : 5,

                  boxShadow:
                    position === "center"
                      ? "0 20px 50px rgba(0,0,0,0.35)"
                      : "0 10px 25px rgba(0,0,0,0.15)",

                  transition: "all 0.55s cubic-bezier(0.77,0,0.18,1)"
                }}
              >

                <img
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1), transparent)"
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    background: "rgba(255,255,255,0.9)",
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 999
                  }}
                >
                  เติม UID ทันที
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 18,
                    left: 18,
                    color: "#fff"
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    {banner.title || 'Banner'}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    {banner.description || ''}
                  </div>
                </div>

              </div>
            )
          })}

          {/* arrows */}
          <button
            onClick={prev}
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full backdrop-blur-md z-50 hover:bg-black/60 transition-all"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-10 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full backdrop-blur-md z-50 hover:bg-black/60 transition-all"
          >
            ›
          </button>

        </div>
      )}
    </div>
  )
}