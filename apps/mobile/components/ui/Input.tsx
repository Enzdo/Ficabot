import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { colors, radius } from '@/constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, style, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, isFocused && !error && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : isFocused ? styles.inputFocused : styles.inputNormal,
            leftIcon ? styles.inputWithIcon : null,
            style,
          ]}
          placeholderTextColor={colors.gray[400]}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e) }}
          onBlur={(e)  => { setIsFocused(false); onBlur?.(e)  }}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[600],
    marginLeft: 2,
  },
  labelFocused: { color: colors.green },
  inputWrapper: { position: 'relative' },
  iconContainer: {
    position: 'absolute', left: 14, top: 0, bottom: 0,
    justifyContent: 'center', zIndex: 1,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.dark,
  },
  inputNormal:  { borderColor: colors.gray[200] },
  inputFocused: {
    borderColor: colors.green,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  inputError:   { borderColor: colors.red },
  inputWithIcon: { paddingLeft: 44 },
  error: { fontSize: 12, color: colors.red, marginLeft: 4 },
})
