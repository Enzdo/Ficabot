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

router.get('/', async () => {
  return {
    name: 'Ficabot API',
    version: '1.0.0',
    status: 'running',
  }
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])

  router.group(() => {
    router.get('/me', [AuthController, 'me'])
    router.put('/profile', [AuthController, 'updateProfile'])
    router.put('/email', [AuthController, 'updateEmail'])
    router.put('/password', [AuthController, 'updatePassword'])
    router.post('/logout', [AuthController, 'logout'])
  }).use(middleware.auth())
}).prefix('/auth')

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
}).prefix('/pets').use(middleware.auth())

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
