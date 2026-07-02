<template>
  <svg height="1024" viewBox="-30 -30 60 60" width="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="b">
        <circle cx="0" cy="-15" r="9.5" />
        <circle cx="0" cy="-15" r="9.5" transform="rotate(120)" />
        <circle cx="0" cy="-15" r="9.5" transform="rotate(240)" />
      </clipPath>
      <mask id="a">
        <rect fill="white" height="54" width="54" x="-27" y="-27" />
        <circle cx="0" cy="0" fill="black" r="3" />
        <g>
          <rect fill="black" height="4" width="4" x="-2" y="-27" />
          <rect fill="black" height="4" width="1" x="-0.5" y="-6" />
          <circle cx="0" cy="-15" fill="black" r="10.5" />
        </g>
        <g transform="rotate(120)">
          <rect fill="black" height="4" width="4" x="-2" y="-27" />
          <rect fill="black" height="4" width="1" x="-0.5" y="-6" />
          <circle cx="0" cy="-15" fill="black" r="10.5" />
        </g>
        <g transform="rotate(240)">
          <rect fill="black" height="4" width="4" x="-2" y="-27" />
          <rect fill="black" height="4" width="1" x="-0.5" y="-6" />
          <circle cx="0" cy="-15" fill="black" r="10.5" />
        </g>
      </mask>
    </defs>
    <g fill="currentColor" mask="url(#a)">
      <circle cx="0" cy="-11" r="15" />
      <circle cx="0" cy="-11" r="15" transform="rotate(120)" />
      <circle cx="0" cy="-11" r="15" transform="rotate(240)" />
    </g>
    <circle
      clip-path="url(#b)"
      cx="0"
      cy="0"
      fill="none"
      r="11.75"
      stroke="currentColor"
      stroke-width="3.5"
    />
  </svg>
</template>
