/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const PetsController = () => import('#controllers/pets_controller')
const MedicalRecordsController = () => import('#controllers/medical_records_controller')
const HealthBooksController = () => import('#controllers/health_books_controller')
const ChatController = () => import('#controllers/chat_controller')
const RemindersController = () => import('#controllers/reminders_controller')
const VetAppointmentsController = () => import('#controllers/vet_appointments_controller')
const FeedingLogsController = () => import('#controllers/feeding_logs_controller')
const SymptomLogsController = () => import('#controllers/symptom_logs_controller')
const PetPhotosController = () => import('#controllers/pet_photos_controller')
const PetOwnersController = () => import('#controllers/pet_owners_controller')
const HealthController = () => import('#controllers/health_controller')
const UserNotificationsController = () => import('#controllers/user_notifications_controller')

router.get('/', async () => {
  return {
    name: 'Votre Assistant Virtuel API',
    version: '1.0.0',
    status: 'running',
  }
})

// Health check endpoints (for monitoring/k8s)
router.get('/health', [HealthController, 'index'])
router.get('/health/detailed', [HealthController, 'detailed'])
router.get('/health/ready', [HealthController, 'ready'])
router.get('/health/live', [HealthController, 'live'])

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.get('/verify-email/:token', [AuthController, 'verifyEmail'])

  router.group(() => {
    router.get('/me', [AuthController, 'me'])
    router.put('/profile', [AuthController, 'updateProfile'])
    router.put('/email', [AuthController, 'updateEmail'])
    router.put('/password', [AuthController, 'updatePassword'])
    router.post('/logout', [AuthController, 'logout'])
    router.post('/resend-verification', [AuthController, 'resendVerification'])
  }).use(middleware.auth())
}).prefix('/auth')

// User Notifications (Real-time)
router.group(() => {
  router.get('/stream', [UserNotificationsController, 'stream']) // SSE endpoint
  router.get('/unread-count', [UserNotificationsController, 'unreadCount'])
  router.get('/', [UserNotificationsController, 'index'])
  router.put('/:id/read', [UserNotificationsController, 'markAsRead'])
  router.put('/mark-all-read', [UserNotificationsController, 'markAllAsRead'])
  router.delete('/:id', [UserNotificationsController, 'destroy'])
}).prefix('/user/notifications').use(middleware.auth())

router.group(() => {
  router.get('/', [PetsController, 'index'])
  router.post('/', [PetsController, 'store'])
  router.get('/:id', [PetsController, 'show'])
  router.put('/:id', [PetsController, 'update'])
  router.delete('/:id', [PetsController, 'destroy'])

  router.get('/:id/medical-records', [MedicalRecordsController, 'index'])
  router.post('/:id/medical-records', [MedicalRecordsController, 'store'])

  // Pet owners (multi-owner support)
  router.get('/:petId/owners', [PetOwnersController, 'index'])
  router.post('/:petId/owners/invite', [PetOwnersController, 'invite'])
  router.post('/:petId/owners/accept', [PetOwnersController, 'accept'])
  router.post('/:petId/owners/reject', [PetOwnersController, 'reject'])
  router.post('/:petId/owners/leave', [PetOwnersController, 'leave'])
  router.delete('/:petId/owners/:id', [PetOwnersController, 'remove'])
}).prefix('/pets').use(middleware.auth())

// Pending invitations for current user
router.group(() => {
  router.get('/invitations', [PetOwnersController, 'pendingInvitations'])
}).prefix('/user').use(middleware.auth())

router.group(() => {
  router.put('/:recordId', [MedicalRecordsController, 'update'])
  router.delete('/:recordId', [MedicalRecordsController, 'destroy'])
}).prefix('/medical-records').use(middleware.auth())

router.group(() => {
  router.get('/conversations', [ChatController, 'conversations'])
  router.post('/conversations', [ChatController, 'createConversation'])
  router.delete('/conversations', [ChatController, 'deleteConversation'])
  router.get('/', [ChatController, 'index'])
  router.post('/', [ChatController, 'send'])
  router.delete('/', [ChatController, 'clear'])
}).prefix('/chat').use(middleware.auth())

// AI Actions (for chat confirmations)
const ChatActionsController = () => import('#controllers/chat_actions_controller')
router.group(() => {
  router.post('/actions/confirm', [ChatActionsController, 'confirmAction'])
  router.post('/actions/cancel', [ChatActionsController, 'cancelAction'])
}).prefix('/chat').use(middleware.auth())

// Health Book routes
router.group(() => {
  router.get('/:id/health-book', [HealthBooksController, 'show'])
  router.put('/:id/health-book', [HealthBooksController, 'update'])

  // Vaccine entries
  router.post('/:id/health-book/vaccines', [HealthBooksController, 'addVaccine'])
  router.delete('/:id/health-book/vaccines', [HealthBooksController, 'removeVaccine'])

  // Antiparasitic entries
  router.post('/:id/health-book/antiparasitics', [HealthBooksController, 'addAntiparasitic'])
  router.delete('/:id/health-book/antiparasitics', [HealthBooksController, 'removeAntiparasitic'])

  // Deworming entries
  router.post('/:id/health-book/dewormings', [HealthBooksController, 'addDeworming'])
  router.delete('/:id/health-book/dewormings', [HealthBooksController, 'removeDeworming'])

  // Surgery entries
  router.post('/:id/health-book/surgeries', [HealthBooksController, 'addSurgery'])
  router.delete('/:id/health-book/surgeries', [HealthBooksController, 'removeSurgery'])

  // Allergy entries
  router.post('/:id/health-book/allergies', [HealthBooksController, 'addAllergy'])
  router.delete('/:id/health-book/allergies', [HealthBooksController, 'removeAllergy'])

  // Chronic condition entries
  router.post('/:id/health-book/chronic-conditions', [HealthBooksController, 'addChronicCondition'])
  router.delete('/:id/health-book/chronic-conditions', [HealthBooksController, 'removeChronicCondition'])

  // Medication entries
  router.post('/:id/health-book/medications', [HealthBooksController, 'addMedication'])
  router.delete('/:id/health-book/medications', [HealthBooksController, 'removeMedication'])

  // Vet visit entries
  router.post('/:id/health-book/vet-visits', [HealthBooksController, 'addVetVisit'])
  router.delete('/:id/health-book/vet-visits', [HealthBooksController, 'removeVetVisit'])

  // Weight history entries
  router.post('/:id/health-book/weight-history', [HealthBooksController, 'addWeightHistory'])
  router.delete('/:id/health-book/weight-history', [HealthBooksController, 'removeWeightHistory'])

  // Scan photo with GPT Vision
  router.post('/:id/health-book/scan', [HealthBooksController, 'scanPhoto'])
  router.post('/:id/health-book/apply-scan', [HealthBooksController, 'applyScannedData'])

  // Feeding logs
  router.get('/:petId/feeding', [FeedingLogsController, 'index'])
  router.post('/:petId/feeding', [FeedingLogsController, 'store'])
  router.put('/:petId/feeding/:id', [FeedingLogsController, 'update'])
  router.delete('/:petId/feeding/:id', [FeedingLogsController, 'destroy'])

  // Symptom logs
  router.get('/:petId/symptoms', [SymptomLogsController, 'index'])
  router.post('/:petId/symptoms', [SymptomLogsController, 'store'])
  router.put('/:petId/symptoms/:id', [SymptomLogsController, 'update'])
  router.delete('/:petId/symptoms/:id', [SymptomLogsController, 'destroy'])

  // Pet photos
  router.get('/:petId/photos', [PetPhotosController, 'index'])
  router.post('/:petId/photos', [PetPhotosController, 'store'])
  router.put('/:petId/photos/:id/profile', [PetPhotosController, 'setProfile'])
  router.delete('/:petId/photos/:id', [PetPhotosController, 'destroy'])
}).prefix('/pets').use(middleware.auth())

// Reminders
router.group(() => {
  router.get('/', [RemindersController, 'index'])
  router.post('/', [RemindersController, 'store'])
  router.put('/:id', [RemindersController, 'update'])
  router.put('/:id/complete', [RemindersController, 'complete'])
  router.delete('/:id', [RemindersController, 'destroy'])
}).prefix('/reminders').use(middleware.auth())

// Vet Appointments
router.group(() => {
  router.get('/', [VetAppointmentsController, 'index'])
  router.post('/', [VetAppointmentsController, 'store'])
  router.get('/:id', [VetAppointmentsController, 'show'])
  router.put('/:id', [VetAppointmentsController, 'update'])
  router.delete('/:id', [VetAppointmentsController, 'destroy'])
}).prefix('/appointments').use(middleware.auth())

// Weight History
const WeightHistoryController = () => import('#controllers/weight_history_controller')
router.group(() => {
  router.get('/:petId/weight', [WeightHistoryController, 'index'])
  router.post('/:petId/weight', [WeightHistoryController, 'store'])
  router.delete('/:petId/weight/:id', [WeightHistoryController, 'destroy'])
}).prefix('/pets').use(middleware.auth())

// Activities (walks, play, etc.)
const ActivitiesController = () => import('#controllers/activities_controller')
router.group(() => {
  router.get('/:petId/activities', [ActivitiesController, 'index'])
  router.post('/:petId/activities', [ActivitiesController, 'store'])
  router.get('/:petId/activities/stats', [ActivitiesController, 'stats'])
  router.delete('/:petId/activities/:id', [ActivitiesController, 'destroy'])
}).prefix('/pets').use(middleware.auth())

// Expenses
const ExpensesController = () => import('#controllers/expenses_controller')
router.group(() => {
  router.get('/', [ExpensesController, 'index'])
  router.post('/', [ExpensesController, 'store'])
  router.get('/stats', [ExpensesController, 'stats'])
  router.put('/:id', [ExpensesController, 'update'])
  router.delete('/:id', [ExpensesController, 'destroy'])
}).prefix('/expenses').use(middleware.auth())

// Shopping List
const ShoppingController = () => import('#controllers/shopping_controller')
router.group(() => {
  router.get('/', [ShoppingController, 'index'])
  router.post('/', [ShoppingController, 'store'])
  router.put('/:id', [ShoppingController, 'update'])
  router.post('/:id/toggle', [ShoppingController, 'toggle'])
  router.delete('/:id', [ShoppingController, 'destroy'])
  router.delete('/completed/clear', [ShoppingController, 'clearCompleted'])
}).prefix('/shopping').use(middleware.auth())

// Badges
const BadgesController = () => import('#controllers/badges_controller')
router.group(() => {
  router.get('/', [BadgesController, 'index'])
  router.get('/user', [BadgesController, 'userBadges'])
  router.post('/check', [BadgesController, 'checkAndAward'])
}).prefix('/badges').use(middleware.auth())

// Photo Analysis (AI Vision)
const PhotoAnalysisController = () => import('#controllers/photo_analysis_controller')
router.group(() => {
  router.post('/:petId/analyze-photo', [PhotoAnalysisController, 'analyze'])

  // Pre-Diagnosis (AI Multi-Model Analysis)
  const PreDiagnosesController = () => import('#controllers/pre_diagnoses_controller')
  router.post('/:id/pre-diagnosis', [PreDiagnosesController, 'create'])
}).prefix('/pets').use(middleware.auth())

// Pre-Diagnosis routes
const PreDiagnosesController = () => import('#controllers/pre_diagnoses_controller')
router.group(() => {
  router.get('/disclaimer', [PreDiagnosesController, 'disclaimer'])
  router.get('/', [PreDiagnosesController, 'index'])
  router.get('/:id', [PreDiagnosesController, 'show'])
}).prefix('/pre-diagnosis').use(middleware.auth())

// Public Profiles
const PublicProfilesController = () => import('#controllers/public_profiles_controller')
router.group(() => {
  router.post('/:petId/share', [PublicProfilesController, 'generateShareToken'])
  router.post('/:petId/toggle-public', [PublicProfilesController, 'togglePublic'])
}).prefix('/pets').use(middleware.auth())

// Public profile view (no auth)
router.get('/p/:token', [PublicProfilesController, 'show'])

// Vet Access (read-only for veterinarians)
const VetAccessController = () => import('#controllers/vet_access_controller')
router.group(() => {
  router.post('/:petId/vet-access', [VetAccessController, 'generateToken'])
  router.delete('/:petId/vet-access', [VetAccessController, 'revokeToken'])
  router.get('/:petId/vet-access', [VetAccessController, 'getStatus'])
}).prefix('/pets').use(middleware.auth())

// Vet view (no auth required)
router.get('/vet/:token', [VetAccessController, 'show'])

// Weight Goals (Diet Program)
const WeightGoalsController = () => import('#controllers/weight_goals_controller')
router.group(() => {
  router.get('/:petId/diet', [WeightGoalsController, 'show'])
  router.get('/:petId/diet/history', [WeightGoalsController, 'index'])
  router.post('/:petId/diet', [WeightGoalsController, 'store'])
  router.put('/:petId/diet/:id', [WeightGoalsController, 'update'])
  router.post('/:petId/diet/weight', [WeightGoalsController, 'updateWeight'])
  router.post('/:petId/diet/from-ai', [WeightGoalsController, 'createFromAI'])
  router.post('/:petId/diet/:id/complete', [WeightGoalsController, 'complete'])
  router.delete('/:petId/diet/:id', [WeightGoalsController, 'destroy'])
}).prefix('/pets').use(middleware.auth())

// ============================================
// VETERINARIAN ROUTES (Separate authentication)
// ============================================

const VetAuthController = () => import('#controllers/vet_auth_controller')
const VetPatientsController = () => import('#controllers/vet_patients_controller')

// Vet Authentication (public)
router.group(() => {
  router.post('/register', [VetAuthController, 'register'])
  router.post('/login', [VetAuthController, 'login'])
}).prefix('/vet/auth')

// Vet Protected Routes
router.group(() => {
  router.get('/me', [VetAuthController, 'me'])
  router.put('/profile', [VetAuthController, 'updateProfile'])
  router.post('/logout', [VetAuthController, 'logout'])
  router.put('/password', [VetAuthController, 'changePassword'])
  router.delete('/account', [VetAuthController, 'deleteAccount'])
}).prefix('/vet/auth').use(middleware.vetAuth())

// Vet Pre-Diagnoses & AI Chat
const VetPreDiagnosesController = () => import('#controllers/vet_pre_diagnoses_controller')
router.group(() => {
  router.get('/dashboard/stats', [VetPreDiagnosesController, 'stats'])
  router.get('/pre-diagnoses', [VetPreDiagnosesController, 'index'])
  router.get('/pre-diagnoses/:id', [VetPreDiagnosesController, 'show'])
  router.post('/pre-diagnoses/:id/response', [VetPreDiagnosesController, 'respond'])
  router.post('/pre-diagnoses/:id/ai-chat', [VetPreDiagnosesController, 'aiChat'])
  router.get('/notifications', [VetPreDiagnosesController, 'notifications'])
  router.patch('/notifications/:id/read', [VetPreDiagnosesController, 'markNotificationRead'])
}).prefix('/vet').use(middleware.vetAuth())

// Vet Notifications (Real-time)
const NotificationsController = () => import('#controllers/notifications_controller')
router.group(() => {
  router.get('/stream', [NotificationsController, 'stream']) // SSE endpoint
  router.get('/unread-count', [NotificationsController, 'unreadCount'])
  router.get('/', [NotificationsController, 'index'])
  router.put('/:id/read', [NotificationsController, 'markAsRead'])
  router.put('/mark-all-read', [NotificationsController, 'markAllAsRead'])
  router.delete('/:id', [NotificationsController, 'destroy'])
}).prefix('/notifications').use(middleware.vetAuth())

// Vet Patients Management
router.group(() => {
  router.get('/', [VetPatientsController, 'index'])
  router.get('/search', [VetPatientsController, 'search'])
  router.get('/:token', [VetPatientsController, 'show'])
  router.get('/:token/health-book', [VetPatientsController, 'healthBook'])
  router.post('/:token/notes', [VetPatientsController, 'addNote'])
  router.put('/:token/diet/vet-notes', [WeightGoalsController, 'updateVetNotes'])
}).prefix('/vet/patients').use(middleware.vetAuth())

// Vet Clients Management (User-Veterinarian links)
const VetClientsController = () => import('#controllers/vet_clients_controller')
router.group(() => {
  router.get('/', [VetClientsController, 'index'])
  router.get('/pending', [VetClientsController, 'pending'])
  router.get('/search-users', [VetClientsController, 'searchUsers'])
  router.get('/:id', [VetClientsController, 'show'])
  router.post('/invite', [VetClientsController, 'invite'])
  router.post('/:id/accept', [VetClientsController, 'accept'])
  router.post('/:id/reject', [VetClientsController, 'reject'])
  router.delete('/:id', [VetClientsController, 'remove'])
}).prefix('/vet/clients').use(middleware.vetAuth())

// User Veterinarians Management (from user side)
const UserVeterinariansController = () => import('#controllers/user_veterinarians_controller')
router.group(() => {
  router.get('/', [UserVeterinariansController, 'index'])
  router.get('/pending', [UserVeterinariansController, 'pending'])
  router.get('/search', [UserVeterinariansController, 'searchVets'])
  router.post('/request', [UserVeterinariansController, 'request'])
  router.post('/:id/accept', [UserVeterinariansController, 'accept'])
  router.post('/:id/reject', [UserVeterinariansController, 'reject'])
  router.post('/:id/primary', [UserVeterinariansController, 'setPrimary'])
  router.delete('/:id', [UserVeterinariansController, 'remove'])
}).prefix('/user/veterinarians').use(middleware.auth())

// Vet Clinics (public for search, some protected)
const VetClinicsController = () => import('#controllers/vet_clinics_controller')
router.group(() => {
  router.get('/search', [VetClinicsController, 'search'])
  router.get('/verified', [VetClinicsController, 'listVerified'])
  router.post('/get-or-create', [VetClinicsController, 'getOrCreate'])
  router.get('/:id', [VetClinicsController, 'show'])
}).prefix('/clinics')

// Vet Chat (for veterinarians)
const VetChatController = () => import('#controllers/vet_chat_controller')
router.group(() => {
  router.get('/conversations', [VetChatController, 'conversations'])
  router.get('/conversations/:conversationId/messages', [VetChatController, 'messages'])
  router.post('/conversations/:conversationId/messages', [VetChatController, 'send'])
  router.post('/conversations/:conversationId/read', [VetChatController, 'markRead'])
}).prefix('/vet/chat').use(middleware.vetAuth())

// User Vet Chat (for users to chat with their vets)
const UserVetChatController = () => import('#controllers/user_vet_chat_controller')
router.group(() => {
  router.get('/conversations', [UserVetChatController, 'conversations'])
  router.get('/conversations/:conversationId/messages', [UserVetChatController, 'messages'])
  router.post('/conversations/:conversationId/messages', [UserVetChatController, 'send'])
  router.post('/conversations/:conversationId/read', [UserVetChatController, 'markRead'])
}).prefix('/user/vet-chat').use(middleware.auth())

// Vet Employees Management
const VetEmployeesController = () => import('#controllers/vet_employees_controller')
router.group(() => {
  router.get('/', [VetEmployeesController, 'index'])
  router.post('/', [VetEmployeesController, 'store'])
  router.get('/:id', [VetEmployeesController, 'show'])
  router.put('/:id', [VetEmployeesController, 'update'])
  router.delete('/:id', [VetEmployeesController, 'destroy'])
}).prefix('/vet/employees').use(middleware.vetAuth())

// Clinic Appointments Management
const ClinicAppointmentsController = () => import('#controllers/clinic_appointments_controller')
router.group(() => {
  router.get('/', [ClinicAppointmentsController, 'index'])
  router.get('/today', [ClinicAppointmentsController, 'today'])
  router.get('/week', [ClinicAppointmentsController, 'week'])
  router.post('/', [ClinicAppointmentsController, 'store'])
  router.get('/:id', [ClinicAppointmentsController, 'show'])
  router.put('/:id', [ClinicAppointmentsController, 'update'])
  router.patch('/:id/status', [ClinicAppointmentsController, 'updateStatus'])
  router.delete('/:id', [ClinicAppointmentsController, 'destroy'])
}).prefix('/vet/appointments').use(middleware.vetAuth())

// Vet Clinic Settings (info, hours, services)
const VetClinicSettingsController = () => import('#controllers/vet_clinic_settings_controller')
router.group(() => {
  router.get('/info', [VetClinicSettingsController, 'getClinicInfo'])
  router.put('/info', [VetClinicSettingsController, 'updateClinicInfo'])
  router.get('/hours', [VetClinicSettingsController, 'getHours'])
  router.put('/hours', [VetClinicSettingsController, 'updateHours'])
  router.get('/services', [VetClinicSettingsController, 'listServices'])
  router.post('/services', [VetClinicSettingsController, 'createService'])
  router.put('/services/:id', [VetClinicSettingsController, 'updateService'])
  router.delete('/services/:id', [VetClinicSettingsController, 'deleteService'])
}).prefix('/vet/clinic').use(middleware.vetAuth())

// Vet Invoices Management
const VetInvoicesController = () => import('#controllers/vet_invoices_controller')
router.group(() => {
  router.get('/', [VetInvoicesController, 'index'])
  router.get('/stats', [VetInvoicesController, 'stats'])
  router.post('/', [VetInvoicesController, 'store'])
  router.get('/:id', [VetInvoicesController, 'show'])
  router.patch('/:id/status', [VetInvoicesController, 'updateStatus'])
  router.delete('/:id', [VetInvoicesController, 'destroy'])
}).prefix('/vet/invoices').use(middleware.vetAuth())

// Vet Analytics
const VetAnalyticsController = () => import('#controllers/vet_analytics_controller')
router.group(() => {
  router.get('/', [VetAnalyticsController, 'index'])
}).prefix('/vet/analytics').use(middleware.vetAuth())

// Vet Records (completed appointments as medical records)
const VetRecordsController = () => import('#controllers/vet_records_controller')
router.group(() => {
  router.get('/', [VetRecordsController, 'index'])
}).prefix('/vet/records').use(middleware.vetAuth())

// Vet Prescriptions (Ordonnances)
const VetPrescriptionsController = () => import('#controllers/vet_prescriptions_controller')
router.group(() => {
  router.get('/', [VetPrescriptionsController, 'index'])
  router.post('/', [VetPrescriptionsController, 'store'])
  router.get('/:id', [VetPrescriptionsController, 'show'])
  router.patch('/:id', [VetPrescriptionsController, 'update'])
  router.delete('/:id', [VetPrescriptionsController, 'destroy'])
}).prefix('/vet/prescriptions').use(middleware.vetAuth())

// Vet Reminders (Rappels vaccins/traitements)
const VetRemindersController = () => import('#controllers/vet_reminders_controller')
router.group(() => {
  router.get('/', [VetRemindersController, 'index'])
  router.get('/upcoming', [VetRemindersController, 'upcoming'])
  router.post('/', [VetRemindersController, 'store'])
  router.patch('/:id', [VetRemindersController, 'update'])
  router.patch('/:id/complete', [VetRemindersController, 'markCompleted'])
  router.delete('/:id', [VetRemindersController, 'destroy'])
}).prefix('/vet/reminders').use(middleware.vetAuth())

// Vet Consultation Templates
const VetConsultationTemplatesController = () => import('#controllers/vet_consultation_templates_controller')
router.group(() => {
  router.get('/', [VetConsultationTemplatesController, 'index'])
  router.post('/', [VetConsultationTemplatesController, 'store'])
  router.put('/:id', [VetConsultationTemplatesController, 'update'])
  router.delete('/:id', [VetConsultationTemplatesController, 'destroy'])
}).prefix('/vet/templates').use(middleware.vetAuth())

// Inventory
const VetInventoryController = () => import('#controllers/vet_inventory_controller')
router.group(() => {
  router.get('/', [VetInventoryController, 'index'])
  router.get('/stats', [VetInventoryController, 'stats'])
  router.post('/', [VetInventoryController, 'store'])
  router.put('/:id', [VetInventoryController, 'update'])
  router.post('/:id/movement', [VetInventoryController, 'addMovement'])
  router.get('/:id/movements', [VetInventoryController, 'movements'])
  router.delete('/:id', [VetInventoryController, 'destroy'])
}).prefix('/vet/inventory').use(middleware.vetAuth())

// Weight tracking
const VetWeightController = () => import('#controllers/vet_weight_controller')
router.group(() => {
  router.get('/', [VetWeightController, 'index'])
  router.get('/chart', [VetWeightController, 'chart'])
  router.post('/', [VetWeightController, 'store'])
  router.delete('/:id', [VetWeightController, 'destroy'])
}).prefix('/vet/weight').use(middleware.vetAuth())

// Attachments
const VetAttachmentsController = () => import('#controllers/vet_attachments_controller')
router.group(() => {
  router.get('/', [VetAttachmentsController, 'index'])
  router.post('/', [VetAttachmentsController, 'store'])
  router.get('/:id/download', [VetAttachmentsController, 'download'])
  router.delete('/:id', [VetAttachmentsController, 'destroy'])
}).prefix('/vet/attachments').use(middleware.vetAuth())

// Hospitalization
const VetHospitalizationController = () => import('#controllers/vet_hospitalization_controller')
router.group(() => {
  router.get('/', [VetHospitalizationController, 'index'])
  router.get('/stats', [VetHospitalizationController, 'stats'])
  router.post('/', [VetHospitalizationController, 'store'])
  router.get('/:id', [VetHospitalizationController, 'show'])
  router.put('/:id', [VetHospitalizationController, 'update'])
  router.post('/:id/discharge', [VetHospitalizationController, 'discharge'])
  router.post('/:id/log', [VetHospitalizationController, 'addLog'])
}).prefix('/vet/hospitalizations').use(middleware.vetAuth())

// Exports
const VetExportsController = () => import('#controllers/vet_exports_controller')
router.group(() => {
  router.get('/clients', [VetExportsController, 'clients'])
  router.get('/invoices', [VetExportsController, 'invoices'])
  router.get('/inventory', [VetExportsController, 'inventory'])
  router.get('/reminders', [VetExportsController, 'reminders'])
}).prefix('/vet/exports').use(middleware.vetAuth())

// User Vet Data (user sees data from their vets)
const UserVetDataController = () => import('#controllers/user_vet_data_controller')
router.group(() => {
  router.get('/prescriptions', [UserVetDataController, 'prescriptions'])
  router.get('/prescriptions/:id', [UserVetDataController, 'prescriptionDetail'])
  router.get('/invoices', [UserVetDataController, 'invoices'])
  router.get('/reminders', [UserVetDataController, 'reminders'])
  router.get('/hospitalizations', [UserVetDataController, 'hospitalizations'])
  router.get('/hospitalizations/:id', [UserVetDataController, 'hospitalizationDetail'])
  router.get('/attachments', [UserVetDataController, 'attachments'])
}).prefix('/user/vet-data').use(middleware.auth())

// Public Booking (no auth required - for clients)
const PublicBookingController = () => import('#controllers/public_booking_controller')
router.group(() => {
  router.get('/:vetId/info', [PublicBookingController, 'getClinicInfo'])
  router.get('/:vetId/availability', [PublicBookingController, 'getAvailability'])
  router.post('/:vetId/book', [PublicBookingController, 'book'])
}).prefix('/public/booking')
