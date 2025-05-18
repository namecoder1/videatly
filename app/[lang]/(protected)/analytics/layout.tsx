import Script from 'next/script'
import React from 'react'

const AnalyticsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
      <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <Script
          src="https://apis.google.com/js/api.js"
          strategy="afterInteractive"
        />
    </div>
  )
}

export default AnalyticsLayout