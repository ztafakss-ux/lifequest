import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { PixelPanel } from '../../components/PixelPanel';
import { colors } from '../../theme/colors';

interface Message { role: 'user' | 'sage'; content: string }

export function SageScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'sage', content: '¡Saludos, héroe! Soy el Sabio del Castillo. ¿En qué puedo guiarte hoy en tu aventura?' }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const r = await api.post<{ reply: string }>('/sage/chat', { message });
      setMessages((m) => [...m, { role: 'sage', content: r.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'sage', content: 'El Sabio no pudo responder en este momento. Inténtalo más tarde.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.sageBubble]}>
            {m.role === 'sage' && <Text style={styles.sageLabel}>🧙 Sabio</Text>}
            <Text style={[styles.bubbleText, m.role === 'user' && styles.userText]}>{m.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.sageBubble}>
            <Text style={styles.sageLabel}>🧙 Sabio</Text>
            <ActivityIndicator color={colors.accentPurple} size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pregúntale al Sabio..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading || !input.trim()}>
          <Text style={styles.sendBtnText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bgDeep },
  messages:       { flex: 1 },
  messagesContent:{ padding: 16, gap: 12 },
  bubble:         { maxWidth: '85%', borderWidth: 2, borderColor: colors.borderPixel, padding: 10 },
  sageBubble:     { alignSelf: 'flex-start', backgroundColor: colors.bgPanel, borderColor: colors.accentPurple },
  userBubble:     { alignSelf: 'flex-end',   backgroundColor: colors.accentBlue + '33', borderColor: colors.accentBlue },
  sageLabel:      { fontFamily: 'monospace', fontSize: 8, color: colors.accentPurple, marginBottom: 4 },
  bubbleText:     { fontFamily: 'monospace', fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
  userText:       { color: colors.textPrimary },
  inputRow:       { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 2, borderColor: colors.borderPixel, backgroundColor: colors.bgPanel },
  input:          { flex: 1, backgroundColor: colors.bgDeep, borderWidth: 2, borderColor: colors.borderPixel, color: colors.textPrimary, fontFamily: 'monospace', fontSize: 13, padding: 8, maxHeight: 80 },
  sendBtn:        { backgroundColor: colors.accentPurple, borderWidth: 2, borderColor: colors.borderPixel, width: 44, justifyContent: 'center', alignItems: 'center' },
  sendBtnText:    { fontFamily: 'monospace', fontSize: 18, color: colors.textPrimary },
});
