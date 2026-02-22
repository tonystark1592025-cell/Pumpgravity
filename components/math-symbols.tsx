import React from 'react'

export const SquareRoot: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return (
    // items-start is the key here: it forces the top edges to align perfectly
    <span className={`inline-flex items-start leading-none ${className}`}>
      
      {/* Radical SVG */}
      <svg
        viewBox="0 0 16 24"
        className="w-[0.8em] shrink-0 text-current"
        style={{ 
          height: '1.3em',      // Tall enough to cover the text and dip below
          marginRight: '-0.5px' // Hides the tiny seam between SVG and border
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 
          y=0.75 perfectly offsets the stroke width so the exact top edge 
          of the line kisses the top edge of the SVG bounding box.
        */}
        <path d="M 1 14 L 6 23 L 16 0.75" />
      </svg>
      
      {/* Content and Overline */}
      <span 
        className="border-t-[1.5px] border-current"
        style={{
          paddingTop: '0.15em',
          paddingLeft: '0.1em',
          paddingRight: '0.1em'
        }}
      >
        {children}
      </span>
      
    </span>
  )
}

/**
 * Kept for alias compatibility so you don't have to change your imports anywhere
 */
export const RadicalSymbol: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return <SquareRoot className={className}>{children}</SquareRoot>
}