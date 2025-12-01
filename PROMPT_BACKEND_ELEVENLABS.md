# Prompt para el Desarrollador Backend

**Asunto:** Implementar Fallback a OpenAI TTS cuando Eleven Labs falle (Sin cambios en Frontend)

**Descripción del Problema:**
Actualmente, cuando se acaban los créditos de Eleven Labs o falla la generación de audio, el backend envía la respuesta de texto (que se guarda correctamente en el historial del chat), pero **no envía el audio** al WebSocket. Esto provoca que en la interfaz de llamada (`CallInterface`), el personaje se quede mudo, ya que el frontend ignora los mensajes que no contienen datos de audio.

**Requerimiento:**
Configurar el backend para que, al detectar un fallo o falta de créditos en Eleven Labs, haga un **fallback automático a OpenAI TTS** (modelo `tts-1` o similar) para generar el audio de la respuesta.

**Especificaciones Técnicas (Protocolo Existente):**
El frontend **no se debe tocar**. El backend debe mantener estrictamente el contrato actual del WebSocket para que la interfaz de llamada reproduzca el audio del fallback sin saber que proviene de otra fuente.

1.  **Lógica de Fallback:**
    *   Intentar generar audio con Eleven Labs.
    *   Si falla (ej. error 402, quota exceeded, timeout), **capturar el error** y proceder inmediatamente a generar el audio usando la API de OpenAI (endpoint `/v1/audio/speech`).

2.  **Formato de Respuesta WebSocket:**
    *   El mensaje enviado al cliente **DEBE** ser de tipo `TTS_RESPONSE` o `VOICE_RESPONSE`.
    *   **DEBE** incluir el campo `audio` con el audio generado codificado en **Base64** (igual que se hace con Eleven Labs).

**Ejemplo del Payload Esperado por el Frontend (JSON):**
```json
{
  "type": "TTS_RESPONSE",  // o "VOICE_RESPONSE"
  "audio": "UklGRi...",    // String Base64 del audio generado por OpenAI
  "content": "Texto de la respuesta...",
  "characterId": 123
}
```

**Nota Importante:**
Si el backend envía un mensaje de tipo `RESPONSE` (solo texto) o `CHUNK` durante la llamada, el frontend lo ignorará para la reproducción de voz. Es crítico que el fallback envíe el tipo `TTS_RESPONSE` con el campo `audio` lleno.
