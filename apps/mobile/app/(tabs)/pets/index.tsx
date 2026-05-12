import { memo, useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { usePetsStore } from '@/stores/pets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DateInput } from '@/components/ui/DateInput'
import { BottomModal } from '@/components/ui/BottomModal'
import { PetCardSkeleton } from '@/components/ui/Skeleton'
import { SPECIES_EMOJI, SPECIES_BG, SPECIES_LABEL } from '@/constants/pets'
import { colors, radius, shadow } from '@/constants/theme'
import type { Pet, Species } from '@/types'

const SPECIES_OPTS: { value: Species; label: string; emoji: string; bg: string }[] = [
  { value: 'dog', label: 'Chien', emoji: '🐕', bg: colors.beigeLight },
  { value: 'cat', label: 'Chat',  emoji: '🐱', bg: colors.greenLight },
]

const PetItem = memo(function PetItem({ pet }: { pet: Pet }) {
  return (
    <Card onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/pets/${pet.id}`) }}>
      <View style={styles.petRow}>
        <View style={[styles.petAvatar, { backgroundColor: SPECIES_BG[pet.species] ?? colors.beigeLight }]}>
          <Text style={styles.petEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
        </View>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {SPECIES_LABEL[pet.species] ?? pet.species}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </Text>
          {pet.weight ? (
            <View style={styles.weightBadge}>
              <Text style={styles.weightText}>{pet.weight} kg</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
      </View>
    </Card>
  )
})

type FormState = { name: string; species: Species; breed: string; birthDate: string; weight: string }
const INITIAL_FORM: FormState = { name: '', species: 'dog', breed: '', birthDate: '', weight: '' }

export default function PetsScreen() {
  const { pets, loading, error, fetchPets, createPet } = usePetsStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPets() }, [fetchPets])

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  const handleCreate = useCallback(async () => {
    if (!form.name) { Alert.alert('Champ requis', 'Le prénom est obligatoire'); return }
    setSaving(true)
    const result = await createPet({
      name: form.name, species: form.species,
      breed: form.breed || undefined, birthDate: form.birthDate || undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
    })
    setSaving(false)
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowModal(false)
      setForm(INITIAL_FORM)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [form, createPet])

  const keyExtractor = useCallback((item: Pet) => item.id, [])
  const renderItem   = useCallback(({ item }: { item: Pet }) => <PetItem pet={item} />, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes animaux</Text>
          <Text style={styles.subtitle}>
            {pets.length === 0 ? 'Aucun animal' : `${pets.length} animal${pets.length !== 1 ? 'x' : ''}`}
          </Text>
        </View>
      </View>

      {error && pets.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Impossible de charger</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <Button title="Réessayer" onPress={fetchPets} style={styles.emptyBtn} />
        </View>
      ) : loading && pets.length === 0 ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => <PetCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={[styles.listContent, pets.length === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPets} tintColor={colors.green} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={(
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyEmoji}>🐾</Text>
              </View>
              <Text style={styles.emptyTitle}>Aucun animal pour l'instant</Text>
              <Text style={styles.emptyDesc}>Ajoutez votre premier compagnon pour commencer à suivre sa santé</Text>
              <Button title="Ajouter un animal" onPress={() => setShowModal(true)} style={styles.emptyBtn} />
            </View>
          )}
        />
      )}

      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowModal(true) }}
        style={({ pressed }) => [styles.fab, shadow.green, pressed && { transform: [{ scale: 0.93 }] }]}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>

      <BottomModal
        visible={showModal}
        title="Ajouter un animal"
        onClose={() => { setShowModal(false); setForm(INITIAL_FORM) }}
        onConfirm={handleCreate}
        saving={saving}
      >
        <View>
          <Text style={styles.fieldLabel}>Espèce</Text>
          <View style={styles.speciesRow}>
            {SPECIES_OPTS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { Haptics.selectionAsync(); setField('species', opt.value) }}
                style={[styles.speciesOpt, form.species === opt.value && styles.speciesOptActive]}
              >
                <View style={[styles.speciesEmojiWrap, { backgroundColor: opt.bg }]}>
                  <Text style={styles.speciesEmoji}>{opt.emoji}</Text>
                </View>
                <Text style={[styles.speciesLabel, form.species === opt.value && styles.speciesLabelActive]}>
                  {opt.label}
                </Text>
                {form.species === opt.value && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
        <Input label="Prénom *" value={form.name} onChangeText={(v) => setField('name', v)} placeholder="Ex: Max" autoCapitalize="words" />
        <Input label="Race" value={form.breed} onChangeText={(v) => setField('breed', v)} placeholder="Ex: Labrador" autoCapitalize="words" />
        <DateInput label="Date de naissance" value={form.birthDate} onChange={(v) => setField('birthDate', v)} maximumDate={new Date()} />
        <Input label="Poids (kg)" value={form.weight} onChangeText={(v) => setField('weight', v)} placeholder="Ex: 12.5" keyboardType="decimal-pad" />
      </BottomModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.beigePale },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:    { fontSize: 28, fontWeight: '800', color: colors.dark },
  subtitle: { fontSize: 13, color: colors.gray[400], marginTop: 2 },

  skeletonList:{ paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  list:        { flex: 1, paddingHorizontal: 20 },
  listContent: { paddingBottom: 100, paddingTop: 8 },
  listEmpty:   { flex: 1 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.greenLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  emptyDesc:  { fontSize: 14, color: colors.gray[500], textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 20 },
  emptyBtn:   { width: 220 },

  petRow:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  petAvatar: { width: 60, height: 60, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  petEmoji:  { fontSize: 30 },
  petInfo:   { flex: 1 },
  petName:   { fontSize: 17, fontWeight: '700', color: colors.dark },
  petBreed:  { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  weightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.beigeLight, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4,
  },
  weightText: { fontSize: 11, fontWeight: '600', color: colors.gray[700] },

  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },

  fieldLabel:   { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginLeft: 2, marginBottom: 8 },
  speciesRow: { flexDirection: 'row', gap: 12 },
  speciesOpt: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  speciesOptActive:   { borderColor: colors.green, backgroundColor: colors.greenLight },
  speciesEmojiWrap:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  speciesEmoji:       { fontSize: 20 },
  speciesLabel:       { flex: 1, fontSize: 14, fontWeight: '600', color: colors.gray[600] },
  speciesLabelActive: { color: colors.greenDark },
})
