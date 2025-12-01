# Assets Directory Structure

Este proyecto utiliza la siguiente estructura para organizar los recursos multimedia:

## 📁 Estructura de Carpetas

### `public/` (Assets estáticos accesibles directamente)
```
public/
├── videos/                    # Videos principales
│   ├── login-hero.mp4        # Video del login (lado derecho)
│   ├── dashboard-intro.mp4   # Video de introducción del dashboard
│   └── tutorials/            # Videos tutoriales
│
├── images/
│   ├── logos/                # Logos de la aplicación
│   │   ├── cronos-logo.png
│   │   ├── cronos-icon.png
│   │   └── cronos-white.png
│   │
│   ├── backgrounds/          # Imágenes de fondo
│   │   ├── login-bg.jpg
│   │   └── dashboard-bg.jpg
│   │
│   ├── characters/           # Avatares de personajes históricos
│   │   ├── miguel-grau.jpg
│   │   ├── pachacutec.jpg
│   │   └── ...
│   │
│   └── ui/                   # Elementos de UI (iconos, ilustraciones)
│       ├── hero-icon.svg
│       └── placeholder.png
```

### `src/assets/` (Assets procesados por Vite)
```
src/assets/
├── images/                    # Imágenes importadas en componentes
│   ├── logo.svg
│   └── icons/
│
└── videos/                    # Videos importados (si es necesario)
```

## 🎯 Guía de Uso

### Videos en `public/videos/`
Los videos en esta carpeta se acceden directamente:
```jsx
<video src="/videos/login-hero.mp4" />
```

**Casos de uso:**
- Video del login (lado derecho de la pantalla)
- Videos de introducción o onboarding
- Videos que se cargan dinámicamente desde la API

### Imágenes en `public/images/`
Las imágenes en esta carpeta se acceden directamente:
```jsx
<img src="/images/logos/cronos-logo.png" alt="Cronos" />
```

**Casos de uso:**
- Logos que se cargan desde HTML/CSS
- Avatares de personajes que vienen de la API
- Backgrounds grandes que no necesitan optimización de bundler

### Assets en `src/assets/`
Los assets en esta carpeta se importan en los componentes:
```jsx
import logo from '@/assets/images/logo.svg'
<img src={logo} alt="Logo" />
```

**Casos de uso:**
- Logos/iconos pequeños que se optimizan con el bundler
- SVGs que se usan en componentes
- Imágenes críticas que deben estar en el bundle inicial

## 📝 Notas Importantes

1. **Tamaño de archivos:**
   - Videos: Comprimir para web (< 10MB recomendado)
   - Imágenes: Optimizar antes de subir (WebP preferido)
   
2. **Nombres de archivo:**
   - Usar kebab-case: `login-hero.mp4`, `miguel-grau.jpg`
   - Sin espacios ni caracteres especiales
   
3. **Formatos recomendados:**
   - Videos: MP4 (H.264) o WebM
   - Imágenes: WebP, PNG, JPG, SVG
   
4. **Git LFS (opcional):**
   - Para archivos > 5MB, considerar usar Git LFS
   - Configurar `.gitattributes` si es necesario
