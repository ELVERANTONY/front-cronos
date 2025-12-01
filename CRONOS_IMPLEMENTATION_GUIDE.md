# CRONOS - Guía Completa de Implementación Frontend

## 📋 Resumen General
Cronos es una aplicación educativa que permite a estudiantes conversar con personajes históricos mediante chat de texto y llamadas de voz. Esta guía documenta todas las implementaciones realizadas en el frontend React.

---

## 🏗️ Estructura de la Aplicación

### **1. Dashboard (Inicio del Estudiante)**
**Ubicación**: `src/pages/Dashboard.jsx`

**Características Actuales**:
- Pantalla de bienvenida con nombre del usuario
- 3 tarjetas principales: Mis Cursos, Progreso, Calendario
- Navbar con logo de Cronos y botón de cerrar sesión
- Diseño con gradientes y efectos glassmorphism

**Pendiente de Implementar**:
- **Asistente Académico IA**: Un chatbot que:
  - Recomienda personajes según temas (ej: "Quiero aprender ciencias" → "Te recomiendo a Albert Einstein")
  - Explica cómo funciona la aplicación
  - Informa sobre configuraciones (modo claro/oscuro)
  - NO responde preguntas académicas directas (como "¿cuánto es 1+1?")
  - Solo actúa como guía y asistente de navegación
  
**System Prompt Sugerido para el Asistente**:
```
Eres el Asistente Académico de Cronos, una aplicación educativa donde estudiantes conversan con personajes históricos.

TU ROL:
- Recomendar personajes históricos según los temas que el estudiante quiera aprender
- Explicar cómo funciona la aplicación Cronos
- Informar sobre configuraciones disponibles
- Dar recordatorios y estadísticas personalizadas

LO QUE NO PUEDES HACER:
- NO respondas preguntas académicas directas (matemáticas, ciencias, historia, etc.)
- NO actúes como tutor de materias
- Si te preguntan algo académico, redirige al estudiante a conversar con un personaje histórico

EJEMPLOS:
Usuario: "Quiero aprender sobre física"
Tú: "¡Excelente! Te recomiendo conversar con Albert Einstein en la sección 'Explorar'. Él puede ayudarte con física, relatividad y más."

Usuario: "¿Cuánto es 2+2?"
Tú: "No puedo resolver problemas matemáticos, pero puedo recomendarte hablar con Isaac Newton o Albert Einstein en 'Explorar' para aprender matemáticas."

Usuario: "¿Cómo funciona la app?"
Tú: "Cronos te permite conversar con personajes históricos mediante chat de texto o llamadas de voz. Ve a 'Explorar' para descubrir personajes, luego haz clic en uno para iniciar una conversación."
```

**Endpoints Necesarios**:
- `POST /api/assistant/chat` - Enviar mensaje al asistente y recibir respuesta
  - Body: `{ message: string, userId: number }`
  - Response: `{ response: string, suggestions?: string[] }`

---

### **2. Explorar (ExploreCharacters)**
**Ubicación**: `src/pages/student/ExploreCharacters.jsx`

**Características Implementadas**:
- ✅ Grid de personajes con diseño tipo Netflix/Spotify
- ✅ Barra de búsqueda flotante con efectos glassmorphism
- ✅ Filtros por categorías (pills horizontales)
- ✅ **Paginación de 8 personajes por página**
- ✅ Tarjetas de personajes con:
  - Imagen de fondo (poster)
  - Nombre del personaje
  - Badge de categoría
  - Efecto hover con animaciones
  - Botón flotante de chat
- ✅ Estados de carga (skeleton screens)
- ✅ Estado vacío cuando no hay resultados

**Endpoints Utilizados**:
- `GET /api/student/characters?page={page}&size=8` - Obtener todos los personajes
- `GET /api/student/categories/{categoryId}/characters?page={page}&size=8` - Filtrar por categoría
- `GET /api/student/characters/search?query={query}` - Buscar personajes
- `GET /api/student/categories?page=0&size=100` - Obtener todas las categorías

**Configuración de Paginación**:
```javascript
// Tamaño de página: 8 personajes
const PAGE_SIZE = 8;

// Llamadas API
studentService.getAllCharacters(page, 8);
studentService.getCharactersByCategory(categoryId, page, 8);
```

---

### **3. Mis Chats (ChatList)**
**Ubicación**: `src/pages/student/ChatList.jsx`

**Características Implementadas**:
- ✅ Lista de conversaciones activas
- ✅ Diseño tipo WhatsApp/Telegram
- ✅ Cada chat muestra:
  - Avatar del personaje
  - Nombre del personaje
  - Último mensaje
  - Timestamp
  - Badge de mensajes no leídos (si aplica)
- ✅ Búsqueda de chats
- ✅ Ordenamiento por fecha (más recientes primero)
- ✅ Click para abrir conversación

**Endpoints Utilizados**:
- `GET /api/student/chats` - Obtener lista de conversaciones
  - Response: `Array<{ id, characterId, characterName, characterAvatar, lastMessage, timestamp, unreadCount }>`

---

### **4. Interfaz de Chat (ChatInterface)**
**Ubicación**: `src/pages/student/ChatInterface.jsx`

**Características Implementadas**:
- ✅ Diseño tipo WhatsApp con:
  - Header fijo con avatar y nombre del personaje
  - Área de mensajes scrollable
  - Input fijo en la parte inferior
- ✅ Mensajes con burbujas diferenciadas:
  - Usuario: Azul, alineado a la derecha
  - Personaje: Gris, alineado a la izquierda
- ✅ Botón de llamada de voz (icono de teléfono)
- ✅ Auto-scroll al último mensaje
- ✅ Indicador de "escribiendo..." cuando el personaje está respondiendo
- ✅ Envío de mensajes con Enter
- ✅ Diseño responsive con card container

**WebSocket para Chat**:
```javascript
// Conexión WebSocket
const ws = new WebSocket(`ws://localhost:8005/ws/chat?token=${jwt_token}`);

// Enviar mensaje
ws.send(JSON.stringify({
  type: 'TEXT',
  content: messageText,
  characterId: parseInt(characterId),
  isVoiceMode: false
}));

// Recibir respuestas
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type puede ser: 'TEXT_RESPONSE', 'ERROR', 'END'
};
```

**Endpoints REST**:
- `GET /api/student/characters/{characterId}` - Obtener detalles del personaje
- `GET /api/student/chats/{characterId}/messages` - Obtener historial de mensajes

---

### **5. Interfaz de Llamada (CallInterface)**
**Ubicación**: `src/pages/student/CallInterface.jsx`

Esta es la implementación más compleja y crítica de la aplicación.

#### **5.1. Características Visuales**

**Diseño**:
- ✅ Pantalla completa con fondo oscuro (#1e2330)
- ✅ Avatar del personaje centrado (circular, 224x224px)
- ✅ Nombre y categoría del personaje debajo del avatar
- ✅ Efectos de glow animados cuando:
  - Usuario habla: Glow verde
  - IA habla: Glow azul
- ✅ Indicador de estado en la parte superior:
  - "Conectando" (amarillo)
  - "Escuchando" (verde)
  - "Procesando" (azul, spinning)
  - "Hablando" (azul, con icono de volumen)
  - "Silenciado" (rojo)

**Elementos de UI**:
- ✅ Botón de colgar (esquina superior izquierda)
- ✅ Transcripción del usuario (texto grande, centrado)
- ✅ Indicador "Pensando..." cuando procesa
- ✅ Barra de nivel de audio (en la parte inferior)
- ✅ Botones de control (parte inferior):
  - Mutear/Desmutear (icono de micrófono)
  - Colgar (botón rojo grande)

#### **5.2. Detección de Voz (VAD - Voice Activity Detection)**

**Configuración Crítica**:
```javascript
const THRESHOLD = 50; // Umbral muy alto para ignorar ruidos
const SILENCE_DURATION = 1200; // 1.2 segundos de silencio antes de enviar
const VOICE_DETECTION_WINDOW = 500; // Requiere 500ms de voz sostenida
const VOICE_FREQ_MIN = 300; // Frecuencia mínima de voz humana (Hz)
const VOICE_FREQ_MAX = 3400; // Frecuencia máxima de voz humana (Hz)
const MIN_DETECTIONS_REQUIRED = 5; // Requiere 5 detecciones en la ventana
```

**Algoritmo de Detección**:
1. **Análisis de Frecuencias**: Solo analiza el rango 300-3400 Hz (voz humana)
2. **Planicidad Espectral**: Distingue voz (tonal) de sonidos percusivos
   - Voz: Planicidad < 0.3
   - Ruidos (golpes, teclas): Planicidad > 0.5
3. **Detección Sostenida**: Requiere 5 confirmaciones en 500ms
4. **Filtrado de Ruidos**: Ignora:
   - ❌ Respiraciones
   - ❌ Golpes de mesa
   - ❌ Tecleo en teclado
   - ❌ Chasquidos de dedos
   - ❌ Pasos
   - ❌ Ruido de papel
   - ✅ Solo detecta voz humana sostenida

**Código de Detección**:
```javascript
// Análisis de frecuencias de voz
const sampleRate = audioContext.sampleRate;
const binSize = sampleRate / analyser.fftSize;
const minBin = Math.floor(VOICE_FREQ_MIN / binSize);
const maxBin = Math.floor(VOICE_FREQ_MAX / binSize);

let voiceEnergy = 0;
for (let i = minBin; i <= maxBin && i < dataArray.length; i++) {
    voiceEnergy += dataArray[i];
}
const voiceAverage = voiceEnergy / (maxBin - minBin + 1);

// Cálculo de planicidad espectral
const geometricMean = Math.exp(
    dataArray.reduce((sum, val) => sum + Math.log(val + 1), 0) / dataArray.length
);
const arithmeticMean = average;
const spectralFlatness = geometricMean / (arithmeticMean + 1);

// Verificar si es voz (tonal)
const isTonal = spectralFlatness < 0.3;

// Detección final
const hasVoiceHarmonics = voiceAverage > THRESHOLD && average > THRESHOLD * 0.9 && isTonal;
```

#### **5.3. Configuración de Audio**

**MediaRecorder Config**:
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: {
        echoCancellation: true,  // Cancelación de eco
        noiseSuppression: true,  // Supresión de ruido
        autoGainControl: true,   // Control automático de ganancia
        sampleRate: 48000,       // Tasa de muestreo
        channelCount: 1          // Mono
    } 
});

const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
});
```

**AudioContext Config**:
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256; // Tamaño de FFT para análisis de frecuencias
```

#### **5.4. Flujo de Interacción**

**Flujo Normal**:
1. Usuario habla → VAD detecta voz sostenida
2. Usuario deja de hablar → Espera 1.2s de silencio
3. Envía audio al backend → Estado "Procesando"
4. Backend envía transcripción → Muestra en pantalla
5. Backend envía "Pensando..." → Muestra indicador
6. Backend envía audio de respuesta → Estado "Hablando"
7. Audio termina → Vuelve a "Escuchando"

**Interrupción (Barge-in)**:
- Si el usuario habla mientras la IA está hablando:
  1. Detiene inmediatamente el audio de la IA
  2. Cambia a estado "Escuchando"
  3. Ignora paquetes de audio tardíos del backend
  4. Procesa la nueva pregunta del usuario

**Comportamiento del Mute**:
- Al mutear durante "Escuchando": Detiene grabación, cambia a "Silenciado"
- Al mutear durante "Procesando" o "Hablando": NO interrumpe, solo detiene grabación
- Al desmutear: Reinicia grabación, vuelve a "Escuchando"

#### **5.5. WebSocket para Voz**

**Conexión**:
```javascript
const ws = new WebSocket(`ws://localhost:8005/ws/chat?token=${jwt_token}`);
```

**Enviar Audio**:
```javascript
// Grabar audio y convertir a base64
const base64Audio = await stopRecording();

ws.send(JSON.stringify({
    type: 'AUDIO',
    audio: base64Audio,  // Audio en base64
    characterId: parseInt(characterId),
    isVoiceMode: true
}));
```

**Recibir Mensajes**:
```javascript
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'USER_TRANSCRIPT':
            // Mostrar lo que el usuario dijo
            setUserTranscript(data.content);
            break;
            
        case 'TTS_RESPONSE':
        case 'VOICE_RESPONSE':
            // Reproducir audio de la IA
            playAudioFromBase64(data.audio);
            break;
            
        case 'ERROR':
            console.error('Error:', data.content);
            break;
            
        case 'END':
            // Conversación terminada
            break;
    }
};
```

**Reproducir Audio**:
```javascript
const playAudioFromBase64 = (base64Audio) => {
    // Convertir base64 a blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    
    // Reproducir
    const audio = new Audio(audioUrl);
    audio.play();
    
    // Notificar al backend que está hablando
    ws.send(JSON.stringify({ 
        type: "ASSISTANT_SPEAKING", 
        speaking: true 
    }));
    
    // Cuando termina
    audio.onended = () => {
        ws.send(JSON.stringify({ 
            type: "ASSISTANT_SPEAKING", 
            speaking: false 
        }));
        setStatus('listening');
    };
};
```

#### **5.6. Gestión de Estado**

**Estados Posibles**:
- `connecting`: Conectando al WebSocket
- `listening`: Escuchando al usuario
- `processing`: Procesando la pregunta del usuario
- `speaking`: La IA está hablando
- `muted`: Micrófono silenciado

**Transcripción**:
- Se muestra cuando el backend envía `USER_TRANSCRIPT`
- Se limpia cuando la IA empieza a hablar
- Se limpia cuando el usuario empieza a hablar de nuevo

**Indicador "Pensando..."**:
- Solo se muestra en estado `processing`
- Aparece después de enviar el audio
- Desaparece cuando llega la respuesta de audio

---

## 🔧 Hooks Personalizados

### **useAudioRecorder**
**Ubicación**: `src/hooks/useAudioRecorder.js`

**Funcionalidad**:
- Gestiona el acceso al micrófono
- Graba audio en formato WebM/Opus
- Convierte audio a base64
- Mantiene el stream en React state para reconexión del VAD

**Uso**:
```javascript
const { isRecording, startRecording, stopRecording, stream } = useAudioRecorder();

// Iniciar grabación
await startRecording();

// Detener y obtener audio
const base64Audio = await stopRecording();
```

### **useChatWebSocket**
**Ubicación**: `src/hooks/useChatWebSocket.js`

**Funcionalidad**:
- Gestiona la conexión WebSocket
- Reconexión automática
- Manejo de mensajes entrantes
- Envío de mensajes

**Uso**:
```javascript
const { sendMessage, isConnected } = useChatWebSocket(token, handleMessage);

// Enviar mensaje
sendMessage({
    type: 'AUDIO',
    audio: base64Audio,
    characterId: 1,
    isVoiceMode: true
});
```

---

## 🎨 Diseño y Estilos

### **Paleta de Colores**
```css
/* Fondos */
--bg-primary: #1a1f2e;
--bg-secondary: #1e2330;
--bg-card: #252a3a;

/* Bordes */
--border-subtle: rgba(255, 255, 255, 0.05);
--border-hover: rgba(59, 130, 246, 0.3);

/* Texto */
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--text-muted: #64748b;

/* Acentos */
--accent-blue: #3b82f6;
--accent-green: #22c55e;
--accent-red: #ef4444;
```

### **Efectos Glassmorphism**
```css
.glass-effect {
    background: rgba(30, 35, 48, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### **Animaciones**
- Hover en tarjetas: `transform: translateY(-8px)`
- Glow effects: `box-shadow: 0 0 50px rgba(color, 0.6)`
- Pulse animations para indicadores de estado
- Smooth transitions: `transition: all 0.3s ease`

---

## 📡 Endpoints del Backend

### **Autenticación**
- `POST /api/auth/login` - Login
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, email, role } }`

### **Personajes**
- `GET /api/student/characters?page={page}&size={size}` - Lista de personajes
- `GET /api/student/characters/{id}` - Detalles de personaje
- `GET /api/student/characters/search?query={query}` - Buscar personajes
- `GET /api/student/categories/{categoryId}/characters?page={page}&size={size}` - Por categoría

### **Categorías**
- `GET /api/student/categories?page={page}&size={size}` - Lista de categorías

### **Chats**
- `GET /api/student/chats` - Lista de conversaciones
- `GET /api/student/chats/{characterId}/messages` - Historial de mensajes

### **WebSocket**
- `ws://localhost:8005/ws/chat?token={jwt_token}` - Conexión para chat y voz

---

## 🚀 Configuración del Proyecto

### **Variables de Entorno**
```env
VITE_API_URL=http://localhost:8005
VITE_WS_URL=ws://localhost:8005
```

### **Dependencias Principales**
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

### **Estructura de Carpetas**
```
src/
├── components/
│   ├── student/
│   │   └── StudentLayout.jsx
│   └── Button.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useAudioRecorder.js
│   └── useChatWebSocket.js
├── pages/
│   ├── student/
│   │   ├── ExploreCharacters.jsx
│   │   ├── ChatList.jsx
│   │   ├── ChatInterface.jsx
│   │   └── CallInterface.jsx
│   ├── Dashboard.jsx
│   └── Login.jsx
├── services/
│   └── studentService.js
└── App.jsx
```

---

## ✅ Checklist de Implementación

### Dashboard
- [x] Diseño básico con tarjetas
- [ ] Asistente Académico IA
- [ ] Estadísticas del usuario
- [ ] Recordatorios

### Explorar
- [x] Grid de personajes
- [x] Búsqueda
- [x] Filtros por categoría
- [x] Paginación (8 por página)
- [x] Diseño responsive

### Mis Chats
- [x] Lista de conversaciones
- [x] Búsqueda de chats
- [x] Diseño tipo WhatsApp

### Chat Interface
- [x] Burbujas de mensajes
- [x] Auto-scroll
- [x] Botón de llamada
- [x] WebSocket para mensajes
- [x] Indicador de "escribiendo..."

### Call Interface
- [x] Diseño de pantalla completa
- [x] VAD con detección de voz humana
- [x] Filtrado de ruidos (respiración, teclas, golpes)
- [x] Análisis de frecuencias (300-3400 Hz)
- [x] Planicidad espectral
- [x] Detección sostenida (500ms)
- [x] Interrupción (barge-in)
- [x] Mute inteligente
- [x] Transcripción en pantalla
- [x] Indicador "Pensando..."
- [x] Barra de nivel de audio
- [x] WebSocket para audio
- [x] Reproducción de respuestas

---

## 🐛 Problemas Conocidos y Soluciones

### Problema: VAD se activa con ruidos
**Solución**: Implementado análisis de planicidad espectral y detección sostenida

### Problema: Stream de audio no se reconecta después del primer turno
**Solución**: Refactorizado `useAudioRecorder` para usar `useState` con el stream

### Problema: Transcripción no aparece
**Solución**: Verificar que el backend envíe mensaje `USER_TRANSCRIPT` con el contenido

### Problema: Audio se corta al mutear
**Solución**: Mute solo detiene grabación durante "listening", no durante "processing" o "speaking"

---

## 📝 Notas Importantes

1. **Threshold del VAD**: Configurado en 50 para máxima precisión. Puede ajustarse según el ambiente del usuario.

2. **Silence Duration**: 1.2 segundos es óptimo para español. Puede reducirse a 1000ms si el usuario habla muy rápido.

3. **Detección de Voz**: El algoritmo actual es muy estricto. Si algunos usuarios tienen problemas, considerar reducir `MIN_DETECTIONS_REQUIRED` de 5 a 4.

4. **WebSocket**: Asegurar que el backend envíe `USER_TRANSCRIPT` para mostrar lo que el usuario dijo.

5. **Audio Format**: El backend debe enviar audio en formato MP3 codificado en base64.

6. **Paginación**: Configurada en 8 personajes por página. Cambiar en `ExploreCharacters.jsx` líneas 41 y 52.

---

## 🎯 Próximos Pasos Sugeridos

1. **Implementar Asistente Académico** en el Dashboard
2. **Agregar estadísticas** del usuario (tiempo de estudio, personajes visitados)
3. **Sistema de favoritos** para personajes
4. **Historial de llamadas** con duración y fecha
5. **Modo oscuro/claro** (actualmente solo oscuro)
6. **Notificaciones** cuando un personaje tiene nuevo contenido
7. **Compartir conversaciones** interesantes

---

**Fecha de última actualización**: 30 de Noviembre, 2025
**Versión del Frontend**: 1.0.0
**Tecnologías**: React 18, Tailwind CSS, WebSocket, Web Audio API
