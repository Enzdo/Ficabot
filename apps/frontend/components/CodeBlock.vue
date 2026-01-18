<template>
  <div class="code-block-wrapper relative group my-4">
    <div class="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
      <span class="text-xs text-gray-400 font-mono uppercase">{{ language || 'plaintext' }}</span>
      <button
        @click="copyCode"
        class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        :class="{ 'text-green-400': copied }"
      >
        <svg v-if="!copied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>{{ copied ? $t('common.copied') : $t('common.copy') }}</span>
      </button>
    </div>
    <pre 
      class="!mt-0 !mb-0 !rounded-t-none overflow-x-auto bg-gray-800 p-4 rounded-b-lg"
    ><code ref="codeElement" :class="`language-${language}`" class="text-sm" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const props = defineProps<{
  code: string
  language?: string
}>()

const { t } = useI18n()
const codeElement = ref<HTMLElement | null>(null)
const copied = ref(false)

const highlightedCode = computed(() => {
  if (!props.language) {
    return props.code
  }

  try {
    const result = hljs.highlight(props.code, { language: props.language })
    return result.value
  } catch (e) {
    // Fallback to plain text if language not supported
    return props.code
  }
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}
</script>

<style>
.code-block-wrapper pre {
  margin: 0 !important;
}

.code-block-wrapper code {
  background: transparent !important;
  padding: 0 !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  line-height: 1.6;
}
</style>
