<template>
  <svg
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Background -->
    <rect width="256" height="256" rx="60" fill="url(#g-ficabot-pro)" />

    <!-- Paw toes -->
    <ellipse cx="78"  cy="114" rx="21" ry="19" fill="#7EB13F"/>
    <ellipse cx="109" cy="93"  rx="21" ry="19" fill="#7EB13F"/>
    <ellipse cx="147" cy="93"  rx="21" ry="19" fill="#7EB13F"/>
    <ellipse cx="178" cy="114" rx="21" ry="19" fill="#7EB13F"/>

    <!-- Main pad -->
    <ellipse cx="128" cy="158" rx="47" ry="41" fill="#7EB13F"/>

    <!-- Medical cross inside pad -->
    <rect x="121" y="137" width="14" height="42" rx="7" fill="#16212B"/>
    <rect x="104" y="151" width="48" height="14" rx="7" fill="#16212B"/>

    <defs>
      <linearGradient id="g-ficabot-pro" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stop-color="#16212B"/>
        <stop offset="1" stop-color="#16212B"/>
      </linearGradient>
    </defs>
  </svg>
</template>
