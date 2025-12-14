<template>
  <svg
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <rect width="256" height="256" rx="60" fill="url(#gradient)" />
    <path
      d="M128 64C92.6538 64 64 92.6538 64 128C64 163.346 92.6538 192 128 192C163.346 192 192 163.346 192 128C192 92.6538 163.346 64 128 64ZM128 176C101.49 176 80 154.51 80 128C80 101.49 101.49 80 128 80C154.51 80 176 101.49 176 128C176 154.51 154.51 176 128 176Z"
      fill="white"
      fill-opacity="0.9"
    />
    <path
      d="M128 96C110.327 96 96 110.327 96 128C96 145.673 110.327 160 128 160C145.673 160 160 145.673 160 128C160 110.327 145.673 96 128 96ZM112 120C107.582 120 104 116.418 104 112C104 107.582 107.582 104 112 104C116.418 104 120 107.582 120 112C120 116.418 116.418 120 112 120ZM144 120C139.582 120 136 116.418 136 112C136 107.582 139.582 104 144 104C148.418 104 152 107.582 152 112C152 116.418 148.418 120 144 120ZM128 148C120 148 114 142 114 142C114 142 120 138 128 138C136 138 142 142 142 142C142 142 136 148 128 148Z"
      fill="white"
    />
    <!-- Robot Ears/Antenna elements -->
    <path d="M192 64L210 46" stroke="white" stroke-width="16" stroke-linecap="round"/>
    <path d="M64 64L46 46" stroke="white" stroke-width="16" stroke-linecap="round"/>
    
    <defs>
      <linearGradient
        id="gradient"
        x1="0"
        y1="0"
        x2="256"
        y2="256"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#34D399" />
        <stop offset="1" stop-color="#059669" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>
