# Checklist de Solución para Audio en Móvil

Si el audio funciona en Web pero **NO en la App Móvil** (usando el mismo backend), el problema está en la implementación del cliente móvil.

El backend ya está enviando el audio correctamente. La App Móvil debe cumplir estrictamente estos 3 requisitos:

## 1. Enviar el flag `isVoiceMode: true`
Cuando la App envía el audio del usuario al backend (WebSocket), el JSON **DEBE** incluir este campo. Si falta o es `false`, el backend **NO generará audio**.

**Payload correcto desde el Móvil:**
```json
{
  "type": "AUDIO",
  "audio": "Base64String...",
  "characterId": 123,
  "isVoiceMode": true  <-- ¡CRÍTICO!
}
```

## 2. Escuchar el evento `VOICE_RESPONSE`
El backend ahora envía un tipo de mensaje unificado tanto para ElevenLabs como para el fallback de OpenAI. La App debe escuchar `VOICE_RESPONSE` (y `TTS_RESPONSE` por compatibilidad).

**Código (Kotlin/Java/Dart) debe manejar:**
```json
{
  "type": "VOICE_RESPONSE",
  "audio": "Base64String...",  <-- Audio MP3 en Base64
  "provider": "OpenAI" // o "ElevenLabs"
}
```

## 3. Decodificar y Reproducir Base64
La App recibe el audio como un **String Base64**. No es una URL.
*   **Error Común:** Intentar reproducirlo como si fuera un link (`http://...`).
*   **Solución:** Decodificar el Base64 a un `ByteArray` o `File` temporal y reproducirlo con el Media Player nativo.

---

### Pasos de Depuración en Móvil
1.  Imprimir los logs del WebSocket en la App.
2.  Verificar si llega el mensaje `VOICE_RESPONSE`.
    *   **Si NO llega:** La App no está enviando `isVoiceMode: true`.
    *   **Si LLEGA pero no suena:** La App está fallando al decodificar el Base64 o el volumen está bajo/muteado.
