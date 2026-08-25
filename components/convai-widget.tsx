"use client"

import { useEffect } from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string
      }
    }
  }
}

export function ConvAIWidget() {
  useEffect(() => {
    // Load the ElevenLabs ConvAI script if not already loaded
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
      script.async = true
      script.type = 'text/javascript'
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div 
      dangerouslySetInnerHTML={{
        __html: '<elevenlabs-convai agent-id="agent_3401k5vpkxf7fdjv8qhps43y0jpa"></elevenlabs-convai>'
      }}
    />
  )
}

// Component for embedding in specific sections
export function ConvAIButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ConvAIWidget />
    </div>
  )
}
