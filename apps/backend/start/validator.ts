/*
|--------------------------------------------------------------------------
| Messages de validation
|--------------------------------------------------------------------------
|
| VineJS répond en anglais par défaut. Ces messages traversent l'API jusqu'à
| l'écran de l'utilisateur — le handler d'exceptions remonte `messages[0]`
| dans le champ `message` —, donc « The title field must be defined » était
| lu tel quel par une application entièrement en français.
|
| `fields` traduit le nom du champ interpolé dans `{{ field }}` : sans lui,
| l'utilisateur lirait « Le champ dueDate est obligatoire ».
|
*/

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  required: 'Le champ {{ field }} est obligatoire',
  string: 'Le champ {{ field }} doit être du texte',
  number: 'Le champ {{ field }} doit être un nombre',
  boolean: 'Le champ {{ field }} doit être vrai ou faux',
  email: 'Le champ {{ field }} doit être une adresse email valide',
  url: 'Le champ {{ field }} doit être une adresse web valide',
  date: 'Le champ {{ field }} doit être une date valide',
  enum: 'La valeur du champ {{ field }} est invalide',
  in: 'La valeur du champ {{ field }} est invalide',
  positive: 'Le champ {{ field }} doit être un nombre positif',
  min: 'Le champ {{ field }} doit être au moins {{ min }}',
  max: 'Le champ {{ field }} ne doit pas dépasser {{ max }}',
  range: 'Le champ {{ field }} doit être compris entre {{ min }} et {{ max }}',
  // Formulé sans nom après le nombre : `minLength(1)` produirait sinon
  // « au moins 1 caractères ».
  minLength: 'Le champ {{ field }} est trop court (minimum {{ min }})',
  maxLength: 'Le champ {{ field }} est trop long (maximum {{ max }} caractères)',
  fixedLength: 'Le champ {{ field }} doit faire exactement {{ size }} caractères',
  confirmed: 'La confirmation du champ {{ field }} ne correspond pas',
  regex: 'Le format du champ {{ field }} est invalide',
  sameAs: 'Le champ {{ field }} doit être identique au champ {{ otherField }}',
  notSameAs: 'Le champ {{ field }} doit être différent du champ {{ otherField }}',
  array: 'Le champ {{ field }} doit être une liste',
  object: 'Le champ {{ field }} est invalide',
  database: {
    unique: 'Cette valeur de {{ field }} est déjà utilisée',
    exists: "Cette valeur de {{ field }} n'existe pas",
  },
}

const fields = {
  address: 'adresse',
  avatarUrl: 'photo',
  birthDate: 'date de naissance',
  breed: 'race',
  clinic: 'clinique',
  clinicName: 'nom de la clinique',
  description: 'description',
  diagnosisDate: 'date de diagnostic',
  dueDate: "date d'échéance",
  dueTime: 'heure',
  email: 'email',
  firstName: 'prénom',
  gender: 'sexe',
  lastName: 'nom',
  name: 'nom',
  nextDueDate: 'prochaine échéance',
  notes: 'notes',
  password: 'mot de passe',
  petId: 'animal',
  phone: 'téléphone',
  productName: 'produit',
  quantity: 'quantité',
  recurrenceInterval: 'fréquence',
  severity: 'gravité',
  specialization: 'spécialité',
  species: 'espèce',
  status: 'statut',
  symptom: 'symptôme',
  takenAt: 'date de prise',
  title: 'titre',
  treatment: 'traitement',
  type: 'type',
  unit: 'unité',
  unitPrice: 'prix unitaire',
  vetAddress: 'adresse du vétérinaire',
  vetName: 'vétérinaire',
  vetPhone: 'téléphone du vétérinaire',
  website: 'site web',
  weight: 'poids',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)
