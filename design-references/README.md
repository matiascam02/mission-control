# Design References - Mission Control

## Danganronpa-style Agent Chat (2026-02-02)

**Contexto:** Matias quiere un sistema de diálogo 1:1 estilo visual novel cuando haces click en el perfil de un agente.

**Referencias visuales:**
- `danganronpa-ref-1.jpg` - Vista de conversación con personaje (Makoto Naegi)
- `danganronpa-ref-2.jpg` - Vista con personaje grande (Junko Enoshima) y UI de diálogo
- `danganronpa-ref-3.jpg` - Vista isométrica de escenario con múltiples personajes

**Características clave del estilo Danganronpa:**
1. **Background temático** - Escenario detallado y atmosférico
2. **Sprite grande del personaje** - Generalmente lado izquierdo o centro
3. **Text box inferior** - Con nombre del personaje, diálogo, y botones de navegación
4. **Typewriter effect** - Texto aparece letra por letra
5. **Transiciones animadas** - Entrada/salida de personajes
6. **UI minimalista** - Focus en el personaje y el diálogo

**Implementación para Mission Control:**
- Componente: `AgentDialogView.tsx`
- Trigger: Click en `AgentCard`
- Backend: `sessions_send` para chat real con el agente
- Estilo: Coherente con dark theme del Mission Control
- Sprites: Usar los sprites de alta calidad (post-regeneración con Opus 4.5)

**Task ID:** 5cf2ca45-fa0e-4dc3-a12b-c5df46e5ea27
**Assigned to:** Rimuru (UI/UX lead)
