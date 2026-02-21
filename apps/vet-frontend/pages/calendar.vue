<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Calendrier</h1>
        <p class="text-surface-500 mt-1">Vue planning de vos rendez-vous</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="goToToday" class="btn-secondary flex items-center gap-2 !py-2 !px-4 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Aujourd'hui
        </button>
        <div class="flex bg-white border border-surface-200 rounded-xl overflow-hidden">
          <button
            @click="viewMode = 'week'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'week' ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-50'
            ]"
          >
            Semaine
          </button>
          <button
            @click="viewMode = 'day'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'day' ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-50'
            ]"
          >
            Jour
          </button>
        </div>
      </div>
    </div>

    <div class="card !p-4">
      <div class="flex items-center justify-between mb-4">
        <button @click="navigatePrev" class="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 class="font-semibold text-surface-900 text-lg">{{ headerLabel }}</h2>
        <button @click="navigateNext" class="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="viewMode === 'week'" class="overflow-x-auto">
        <div class="min-w-[800px]">
          <div class="grid" :style="{ gridTemplateColumns: '60px repeat(7, 1fr)' }">
            <div class="h-14"></div>
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              class="h-14 flex flex-col items-center justify-center border-b border-surface-100"
            >
              <span class="text-xs text-surface-500 uppercase tracking-wide">{{ day.label }}</span>
              <span
                :class="[
                  'text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full',
                  day.isToday ? 'bg-primary-600 text-white' : 'text-surface-800'
                ]"
              >
                {{ day.dayNumber }}
              </span>
            </div>
          </div>

          <div class="relative">
            <div class="grid" :style="{ gridTemplateColumns: '60px repeat(7, 1fr)' }">
              <template v-for="hour in hours" :key="hour">
                <div class="h-[60px] flex items-start justify-end pr-2 -mt-2">
                  <span class="text-xs text-surface-400 font-medium">{{ String(hour).padStart(2, '0') }}:00</span>
                </div>
                <div
                  v-for="day in weekDays"
                  :key="day.dateStr + '-' + hour"
                  class="h-[60px] border-t border-l border-surface-100 relative"
                  :class="{ 'border-r': day.dayIndex === 6 }"
                ></div>
              </template>
            </div>

            <template v-for="day in weekDays" :key="'apts-' + day.dateStr">
              <div
                v-for="apt in getAppointmentsForDay(day.dateStr)"
                :key="apt.id"
                :style="getAppointmentStyle(apt, day.dayIndex)"
                :class="[
                  'absolute rounded-lg px-1.5 py-1 cursor-pointer overflow-hidden border text-xs leading-tight transition-shadow hover:shadow-md z-10',
                  getAppointmentClasses(apt.type)
                ]"
                @click.stop="togglePopover(apt, $event)"
              >
                <p class="font-semibold truncate">{{ apt.startTime }} {{ apt.petName }}</p>
                <p v-if="apt.duration >= 30" class="truncate opacity-80">{{ apt.clientName }}</p>
              </div>
            </template>

            <div
              v-if="currentTimePosition !== null && isCurrentWeek"
              class="absolute left-[60px] right-0 z-20 pointer-events-none flex items-center"
              :style="{ top: currentTimePosition + 'px' }"
            >
              <div class="w-2.5 h-2.5 bg-danger-500 rounded-full -ml-1.5"></div>
              <div class="flex-1 h-0.5 bg-danger-500"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="viewMode === 'day'" class="overflow-x-auto">
        <div class="min-w-[400px]">
          <div class="grid" :style="{ gridTemplateColumns: '60px 1fr' }">
            <div class="h-10"></div>
            <div class="h-10 flex items-center justify-center border-b border-surface-100">
              <span class="text-sm font-semibold" :class="selectedDayInfo.isToday ? 'text-primary-600' : 'text-surface-800'">
                {{ selectedDayInfo.fullLabel }}
              </span>
            </div>
          </div>

          <div class="relative">
            <div class="grid" :style="{ gridTemplateColumns: '60px 1fr' }">
              <template v-for="hour in hours" :key="hour">
                <div class="h-[60px] flex items-start justify-end pr-2 -mt-2">
                  <span class="text-xs text-surface-400 font-medium">{{ String(hour).padStart(2, '0') }}:00</span>
                </div>
                <div class="h-[60px] border-t border-l border-r border-surface-100 relative"></div>
              </template>
            </div>

            <div
              v-for="apt in dayAppointments"
              :key="apt.id"
              :style="getDayAppointmentStyle(apt)"
              :class="[
                'absolute rounded-lg px-3 py-2 cursor-pointer overflow-hidden border transition-shadow hover:shadow-md z-10',
                getAppointmentClasses(apt.type)
              ]"
              @click.stop="togglePopover(apt, $event)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">{{ apt.petName }}</p>
                  <p class="text-xs opacity-80 truncate">{{ apt.clientName }}</p>
                </div>
                <span class="text-xs font-medium whitespace-nowrap">{{ apt.startTime }} - {{ getEndTime(apt) }}</span>
              </div>
              <div v-if="apt.duration >= 30" class="mt-1 flex items-center gap-2 text-xs opacity-70">
                <span>{{ getTypeLabel(apt.type) }}</span>
                <span v-if="apt.employeeName">&middot; {{ apt.employeeName }}</span>
              </div>
              <p v-if="apt.duration >= 45 && apt.reason" class="mt-1 text-xs opacity-60 truncate">{{ apt.reason }}</p>
            </div>

            <div
              v-if="currentTimePosition !== null && isSelectedDayToday"
              class="absolute left-[60px] right-0 z-20 pointer-events-none flex items-center"
              :style="{ top: currentTimePosition + 'px' }"
            >
              <div class="w-2.5 h-2.5 bg-danger-500 rounded-full -ml-1.5"></div>
              <div class="flex-1 h-0.5 bg-danger-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="popover.visible && popover.appointment"
        class="fixed z-50"
        :style="{ top: popover.y + 'px', left: popover.x + 'px' }"
      >
        <div
          ref="popoverRef"
          class="bg-white rounded-xl shadow-xl border border-surface-200 p-4 w-72"
          @click.stop
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-semibold text-surface-900">{{ popover.appointment.petName }}</h4>
              <p class="text-sm text-surface-500">{{ popover.appointment.clientName }}</p>
            </div>
            <button @click="closePopover" class="p-1 hover:bg-surface-100 rounded-lg transition-colors -mr-1 -mt-1">
              <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatPopoverDate(popover.appointment.date) }}</span>
            </div>
            <div class="flex items-center gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ popover.appointment.startTime }} - {{ getEndTime(popover.appointment) }} ({{ popover.appointment.duration }} min)</span>
            </div>
            <div class="flex items-center gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span :class="getTypeBadgeClasses(popover.appointment.type)">
                {{ getTypeLabel(popover.appointment.type) }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span :class="getStatusBadgeClasses(popover.appointment.status)">
                {{ getStatusLabel(popover.appointment.status) }}
              </span>
            </div>
            <div v-if="popover.appointment.employeeName" class="flex items-center gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ popover.appointment.employeeName }}</span>
            </div>
            <div v-if="popover.appointment.reason" class="flex items-start gap-2 text-surface-600">
              <svg class="w-4 h-4 text-surface-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ popover.appointment.reason }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const api = useVetApi()

interface Appointment {
  id: number
  date: string
  startTime: string
  duration: number
  type: string
  status: string
  petName: string
  clientName: string
  reason: string
  employeeName: string
}

const viewMode = ref<'week' | 'day'>('week')
const currentDate = ref(new Date())
const loading = ref(true)
const appointments = ref<Appointment[]>([])
const popoverRef = ref<HTMLElement | null>(null)

const popover = ref<{
  visible: boolean
  appointment: Appointment | null
  x: number
  y: number
}>({
  visible: false,
  appointment: null,
  x: 0,
  y: 0,
})

const hours = Array.from({ length: 12 }, (_, i) => i + 8)

const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const dayLabelsShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const getMonday = (d: Date): Date => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const toDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayStr = computed(() => toDateStr(new Date()))

const weekStart = computed(() => getMonday(currentDate.value))

const weekDays = computed(() => {
  const monday = weekStart.value
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = toDateStr(d)
    return {
      dateStr,
      dayIndex: i,
      dayNumber: d.getDate(),
      label: dayLabelsShort[i],
      fullLabel: dayLabels[i],
      isToday: dateStr === todayStr.value,
    }
  })
})

const isCurrentWeek = computed(() => {
  return weekDays.value.some(d => d.isToday)
})

const selectedDayInfo = computed(() => {
  const d = currentDate.value
  const dateStr = toDateStr(d)
  const jsDay = d.getDay()
  const idx = jsDay === 0 ? 6 : jsDay - 1
  return {
    dateStr,
    isToday: dateStr === todayStr.value,
    fullLabel: `${dayLabels[idx]} ${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
  }
})

const isSelectedDayToday = computed(() => {
  return toDateStr(currentDate.value) === todayStr.value
})

const headerLabel = computed(() => {
  if (viewMode.value === 'day') {
    return selectedDayInfo.value.fullLabel
  }
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const startDate = new Date(start.dateStr + 'T00:00:00')
  const endDate = new Date(end.dateStr + 'T00:00:00')
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'short' })
  const endMonth = endDate.toLocaleDateString('fr-FR', { month: 'short' })
  const year = endDate.getFullYear()
  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${year}`
  }
  return `${startDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endDay} ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${year}`
})

const dayAppointments = computed(() => {
  const dateStr = toDateStr(currentDate.value)
  return appointments.value
    .filter(a => a.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const navigatePrev = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() - 7)
  } else {
    d.setDate(d.getDate() - 1)
  }
  currentDate.value = d
}

const navigateNext = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() + 7)
  } else {
    d.setDate(d.getDate() + 1)
  }
  currentDate.value = d
}

const goToToday = () => {
  currentDate.value = new Date()
}

const getAppointmentsForDay = (dateStr: string): Appointment[] => {
  return appointments.value
    .filter(a => a.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

const parseTime = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

const getAppointmentStyle = (apt: Appointment, dayIndex: number) => {
  const time = parseTime(apt.startTime)
  const top = (time - 8) * 60
  const height = Math.max((apt.duration / 60) * 60, 18)
  const colFraction = 1 / 7

  return {
    top: `${top}px`,
    left: `calc(60px + (100% - 60px) * ${dayIndex * colFraction} + 2px)`,
    width: `calc((100% - 60px) * ${colFraction} - 4px)`,
    height: `${height}px`,
  }
}

const getDayAppointmentStyle = (apt: Appointment) => {
  const time = parseTime(apt.startTime)
  const top = (time - 8) * 60
  const height = Math.max((apt.duration / 60) * 60, 24)
  return {
    top: `${top}px`,
    left: '64px',
    right: '4px',
    height: `${height}px`,
  }
}

const currentTimePosition = ref<number | null>(null)

const updateCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  if (hours >= 8 && hours < 19) {
    currentTimePosition.value = (hours - 8 + minutes / 60) * 60
  } else {
    currentTimePosition.value = null
  }
}

const getEndTime = (apt: Appointment): string => {
  const [h, m] = apt.startTime.split(':').map(Number)
  const totalMin = h * 60 + m + apt.duration
  const endH = Math.floor(totalMin / 60)
  const endM = totalMin % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    surgery: 'Chirurgie',
    vaccination: 'Vaccination',
    checkup: 'Bilan',
    other: 'Autre',
  }
  return labels[type] || type
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  }
  return labels[status] || status
}

const getAppointmentClasses = (type: string): string => {
  const map: Record<string, string> = {
    consultation: 'bg-primary-100 border-primary-300 text-primary-800',
    surgery: 'bg-danger-50 border-danger-300 text-danger-800',
    vaccination: 'bg-blue-50 border-blue-300 text-blue-800',
    checkup: 'bg-accent-100 border-accent-300 text-accent-800',
    other: 'bg-surface-100 border-surface-300 text-surface-700',
  }
  return map[type] || map.other
}

const getTypeBadgeClasses = (type: string): string => {
  const map: Record<string, string> = {
    consultation: 'badge bg-primary-100 text-primary-700',
    surgery: 'badge bg-danger-50 text-danger-700',
    vaccination: 'badge bg-blue-50 text-blue-700',
    checkup: 'badge bg-accent-100 text-accent-700',
    other: 'badge bg-surface-100 text-surface-600',
  }
  return map[type] || map.other
}

const getStatusBadgeClasses = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'badge bg-warning-50 text-warning-700',
    confirmed: 'badge bg-success-50 text-success-700',
    cancelled: 'badge bg-danger-50 text-danger-700',
    completed: 'badge bg-surface-100 text-surface-600',
  }
  return map[status] || 'badge bg-surface-100 text-surface-600'
}

const formatPopoverDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const togglePopover = (apt: Appointment, event: MouseEvent) => {
  if (popover.value.visible && popover.value.appointment?.id === apt.id) {
    closePopover()
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  let x = rect.right + 8
  let y = rect.top

  if (x + 300 > window.innerWidth) {
    x = rect.left - 300
  }
  if (x < 8) {
    x = 8
  }
  if (y + 280 > window.innerHeight) {
    y = window.innerHeight - 280
  }
  if (y < 8) {
    y = 8
  }

  popover.value = {
    visible: true,
    appointment: apt,
    x,
    y,
  }
}

const closePopover = () => {
  popover.value = {
    visible: false,
    appointment: null,
    x: 0,
    y: 0,
  }
}

const onClickOutside = (e: MouseEvent) => {
  if (!popover.value.visible) return
  const target = e.target as HTMLElement
  if (popoverRef.value && popoverRef.value.contains(target)) return
  closePopover()
}

const loadAppointments = async () => {
  loading.value = true
  try {
    const response = await api.get<Appointment[]>('/vet/appointments')
    if (response.success && response.data) {
      appointments.value = response.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadAppointments()
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 60000)
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  document.removeEventListener('click', onClickOutside)
})

watch(viewMode, () => {
  closePopover()
})
</script>

<style scoped>
.grid {
  position: relative;
}
</style>
