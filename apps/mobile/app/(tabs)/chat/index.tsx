import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Animated, FlatList, KeyboardAvoidingView,
  Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useChatStore } from '@/stores/chat'
import { usePetsStore } from '@/stores/pets'
import { ConversationSkeleton } from '@/components/ui/Skeleton'
import { MarkdownText } from '@/components/ui/MarkdownText'
import { colors, radius, shadow } from '@/constants/theme'
import type { ChatMessage } from '@/types'

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐱', nac: '🐰' }
const SPECIES_BG:    Record<string, string> = { dog: colors.beigeLight, cat: colors.greenLight, nac: colors.greenLight }

const PulsingAvatar = memo(function PulsingAvatar() {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.18, duration: 1400, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,    duration: 1400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.15, duration: 1400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6,  duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start()
  }, [])

  return (
    <View style={welcomeStyles.avatarContainer}>
      <Animated.View style={[welcomeStyles.pulseRing, { transform: [{ scale }], opacity }]} />
      <LinearGradient
        colors={['#2A3520', colors.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={welcomeStyles.avatar}
      >
        <Text style={welcomeStyles.avatarEmoji}>🌿</Text>
      </LinearGradient>
      <View style={welcomeStyles.onlineDot} />
    </View>
  )
})

const TypingIndicator = memo(function TypingIndicator() {
  const dot0 = useRef(new Animated.Value(0)).current
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dots = [dot0, dot1, dot2]

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: -6, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 350, useNativeDriver: true }),
          Animated.delay(400),
        ])
      )
    )
    animations.forEach((a) => a.start())
    return () => animations.forEach((a) => a.stop())
  }, [])

  return (
    <View style={typingStyles.wrap}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[typingStyles.dot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  )
})

export default function ChatScreen() {
  const { conversations, currentConversationId, messages, loading, streaming, fetchConversations, createConversation, selectConversation, sendMessage, selectedPetId } = useChatStore()
  const { pets, fetchPets } = usePetsStore()
  const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId))
  const isNacChat = selectedPet?.species === 'nac'
  const [input, setInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => { fetchConversations(); fetchPets() }, [fetchConversations, fetchPets])

  useEffect(() => { isInitialLoad.current = true }, [currentConversationId])

  const isInitialLoad = useRef(true)
  const scrollToBottom = useCallback(() => {
    const animated = !isInitialLoad.current
    if (isInitialLoad.current) isInitialLoad.current = false
    flatListRef.current?.scrollToEnd({ animated })
  }, [])

  const isSending = useRef(false)
  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || streaming || isSending.current) return
    isSending.current = true
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setInput('')
    try {
      if (!currentConversationId) {
        const convId = await createConversation(undefined, msg.slice(0, 50))
        if (!convId) return
      }
      await sendMessage(msg)
    } finally {
      isSending.current = false
    }
  }

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user'
    return (
      <View style={[msgStyles.row, isUser ? msgStyles.rowUser : msgStyles.rowBot]}>
        {!isUser && (
          <LinearGradient colors={['#2A3520', colors.dark]} style={msgStyles.botAvatar}>
            <Text style={msgStyles.botEmoji}>🌿</Text>
          </LinearGradient>
        )}
        <View style={[msgStyles.bubble, isUser ? msgStyles.bubbleUser : msgStyles.bubbleBot]}>
          {!isUser && <View style={msgStyles.botAccent} />}
          {isUser ? (
            <Text style={[msgStyles.text, msgStyles.textUser]}>{item.message}</Text>
          ) : (
            <MarkdownText style={[msgStyles.text, msgStyles.textBot]} dark={false}>
              {item.message}
            </MarkdownText>
          )}
          <Text style={[msgStyles.time, isUser ? msgStyles.timeUser : msgStyles.timeBot]}>
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header gradient */}
      <LinearGradient colors={['#1A1614', '#1E2214']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => setShowSidebar(!showSidebar)} style={styles.menuBtn}>
          <Ionicons name={showSidebar ? 'close' : 'menu'} size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Assistant Ficana</Text>
          {currentConversationId ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {conversations.find((c) => c.id === currentConversationId)?.title ?? 'Conversation'}
            </Text>
          ) : (
            <View style={styles.headerStatus}>
              <View style={styles.headerDot} />
              <Text style={styles.headerStatusText}>En ligne</Text>
            </View>
          )}
        </View>
        <Pressable onPress={() => createConversation()} style={styles.newBtn}>
          <Ionicons name="add" size={16} color={colors.green} />
          <Text style={styles.newBtnText}>Nouveau</Text>
        </Pressable>
      </LinearGradient>

      {/* Sidebar + backdrop */}
      {showSidebar && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setShowSidebar(false)} />
          <View style={[styles.sidebar, shadow.md]}>
            <LinearGradient colors={['#1A1614', '#1E2214']} style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Conversations</Text>
              {conversations.length > 0 && (
                <View style={styles.sidebarCount}>
                  <Text style={styles.sidebarCountText}>{conversations.length}</Text>
                </View>
              )}
            </LinearGradient>
            {loading && conversations.length === 0 ? (
              <View style={styles.sidebarSkeletons}>
                {[1, 2, 3].map((i) => <ConversationSkeleton key={i} />)}
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.sidebarEmpty}>
                <Text style={styles.sidebarEmptyEmoji}>💬</Text>
                <Text style={styles.sidebarEmptyText}>Aucune conversation</Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => { Haptics.selectionAsync(); selectConversation(item.id); setShowSidebar(false) }}
                    style={({ pressed }) => [styles.convItem, currentConversationId === item.id && styles.convItemActive, pressed && { opacity: 0.65 }]}
                  >
                    <View style={[styles.convDot, currentConversationId === item.id && styles.convDotActive]} />
                    <View style={styles.convTextWrap}>
                      <Text style={[styles.convTitle, currentConversationId === item.id && styles.convTitleActive]} numberOfLines={1}>{item.title}</Text>
                      {item.lastMessage && <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage}</Text>}
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </>
      )}

      {/* Welcome ou messages */}
      {!currentConversationId ? (
        <View style={styles.welcome}>
          <PulsingAvatar />
          <Text style={styles.welcomeTitle}>Assistant Ficana</Text>
          <Text style={styles.welcomeDesc}>
            Je suis là pour vous aider avec la santé de vos animaux : vaccins, alimentation, symptômes et bien plus.
          </Text>

          {pets.length > 0 && (
            <View style={styles.petPickers}>
              <Text style={styles.petPickerLabel}>Commencer à propos de</Text>
              {pets.slice(0, 3).map((pet) => (
                <Pressable
                  key={pet.id}
                  onPress={() => { Haptics.selectionAsync(); createConversation(pet.id, `À propos de ${pet.name}`) }}
                  style={({ pressed }) => [styles.petPickerBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
                >
                  <View style={[styles.petPickerIcon, { backgroundColor: SPECIES_BG[pet.species] ?? colors.beigeLight }]}>
                    <Text>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                  </View>
                  <Text style={styles.petPickerName}>{pet.name}</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.gray[400]} />
                </Pressable>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => createConversation()}
            style={({ pressed }) => [styles.startBtnWrap, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient colors={['#8EC347', '#7EB13F', '#5C8A2A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Démarrer une conversation</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={15}
          ListEmptyComponent={
            loading
              ? <ActivityIndicator style={styles.loadingMsg} color={colors.green} />
              : (
                <View style={styles.emptyMsg}>
                  <Text style={styles.emptyMsgEmoji}>💬</Text>
                  <Text style={styles.emptyMsgText}>Commencez la conversation</Text>
                </View>
              )
          }
          ListFooterComponent={
            streaming ? (
              <View style={[msgStyles.row, msgStyles.rowBot]}>
                <LinearGradient colors={['#2A3520', colors.dark]} style={msgStyles.botAvatar}>
                  <Text style={msgStyles.botEmoji}>🌿</Text>
                </LinearGradient>
                <View style={[msgStyles.bubble, msgStyles.bubbleBot, { paddingVertical: 16 }]}>
                  <View style={msgStyles.botAccent} />
                  <TypingIndicator />
                </View>
              </View>
            ) : null
          }
        />
      )}

      {isNacChat && (
        <View style={styles.nacBanner}>
          <Text style={styles.nacBannerEmoji}>🐰</Text>
          <Text style={styles.nacBannerText}>
            Animal NAC : les conseils sont à titre informatif uniquement. Consultez un vétérinaire spécialisé NAC pour toute question médicale précise.
          </Text>
        </View>
      )}

      {/* Barre de saisie */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Posez votre question..."
            placeholderTextColor={colors.gray[400]}
            multiline
            maxLength={2000}
            style={styles.textInput}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || streaming}
            style={({ pressed }) => [styles.sendBtnWrap, pressed && { transform: [{ scale: 0.88 }] }]}
          >
            <LinearGradient
              colors={input.trim() && !streaming ? ['#8EC347', '#5C8A2A'] : [colors.gray[200], colors.gray[200]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              {streaming
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Ionicons name="arrow-up" size={20} color={colors.white} />
              }
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const welcomeStyles = StyleSheet.create({
  avatarContainer: { position: 'relative', marginBottom: 24, alignItems: 'center', justifyContent: 'center', width: 90, height: 90 },
  pulseRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: colors.green },
  avatar:    { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 36 },
  onlineDot: { position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.white },
})

const typingStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green },
})

const msgStyles = StyleSheet.create({
  row:        { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 5 },
  rowUser:    { justifyContent: 'flex-end' },
  rowBot:     { justifyContent: 'flex-start' },
  botAvatar:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4, flexShrink: 0 },
  botEmoji:   { fontSize: 16 },
  bubble:     { borderRadius: radius['2xl'], paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%', overflow: 'hidden' },
  botAccent:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.green, borderTopLeftRadius: radius['2xl'], borderBottomLeftRadius: radius['2xl'] },
  bubbleUser: { backgroundColor: colors.dark, borderBottomRightRadius: 6 },
  bubbleBot:  { backgroundColor: colors.white, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: colors.gray[200], ...shadow.sm },
  text:       { fontSize: 14, lineHeight: 20 },
  textUser:   { color: colors.white },
  textBot:    { color: colors.dark, paddingLeft: 8 },
  time:       { fontSize: 10, marginTop: 4 },
  timeUser:   { color: 'rgba(255,255,255,0.4)' },
  timeBot:    { color: colors.gray[400], paddingLeft: 8 },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  menuBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerInfo:       { flex: 1 },
  headerTitle:      { fontSize: 15, fontWeight: '700', color: colors.white },
  headerStatus:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  headerDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  headerStatusText: { fontSize: 11, color: colors.green, fontWeight: '600' },
  headerSub:        { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  newBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(126,177,63,0.4)', borderRadius: radius.xl, paddingHorizontal: 10, paddingVertical: 6 },
  newBtnText:       { color: colors.green, fontSize: 12, fontWeight: '700' },

  backdrop:    { position: 'absolute', top: 62, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,22,20,0.5)', zIndex: 9 },
  sidebar:     { position: 'absolute', top: 62, left: 0, bottom: 0, width: 280, backgroundColor: colors.white, zIndex: 10 },
  sidebarHeader: { padding: 16, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sidebarTitle:  { fontSize: 15, fontWeight: '700', color: colors.white },
  sidebarCount:  { backgroundColor: 'rgba(126,177,63,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  sidebarCountText: { fontSize: 12, fontWeight: '700', color: colors.green },
  sidebarSkeletons: { padding: 12, gap: 4 },
  sidebarEmpty:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 40 },
  sidebarEmptyEmoji: { fontSize: 32 },
  sidebarEmptyText:  { fontSize: 13, color: colors.gray[400] },
  convItem:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  convItemActive: { backgroundColor: colors.greenLight },
  convDot:        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.gray[200], flexShrink: 0 },
  convDotActive:  { backgroundColor: colors.green },
  convTextWrap:   { flex: 1 },
  convTitle:      { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  convTitleActive:{ color: colors.greenDark },
  convLast:       { fontSize: 11, color: colors.gray[400], marginTop: 2 },

  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: colors.dark, marginBottom: 10 },
  welcomeDesc:  { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 22, marginBottom: 28 },

  petPickers:    { width: '100%', gap: 8, marginBottom: 24 },
  petPickerLabel:{ fontSize: 11, fontWeight: '700', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  petPickerBtn:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.xl, paddingHorizontal: 14, paddingVertical: 11, ...shadow.sm },
  petPickerIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  petPickerName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.dark },
  startBtnWrap:  { borderRadius: radius.xl, overflow: 'hidden' },
  startBtn:      { paddingHorizontal: 28, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  startBtnText:  { color: colors.white, fontSize: 15, fontWeight: '700' },

  msgList:      { paddingVertical: 16, paddingHorizontal: 4 },
  loadingMsg:   { marginTop: 32 },
  emptyMsg:     { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyMsgEmoji:{ fontSize: 36 },
  emptyMsgText: { fontSize: 13, color: colors.gray[400] },

  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  nacBanner:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.orangeLight, borderTopWidth: 1, borderTopColor: colors.orange },
  nacBannerEmoji: { fontSize: 20 },
  nacBannerText:  { flex: 1, fontSize: 12, color: colors.gray[700], lineHeight: 16 },
  textInput:   { flex: 1, backgroundColor: colors.gray[50], borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: radius['2xl'], paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.dark, maxHeight: 112 },
  sendBtnWrap: { borderRadius: 21 },
  sendBtn:     { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
})
