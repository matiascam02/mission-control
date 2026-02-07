# 🚀 Mission Control - Quick Start

## 🎯 Objetivo

Ver agentes OpenClaw trabajando en tiempo real en un dashboard.

---

## ⚡ Setup Rápido (5 minutos)

### 1. Inicializar Convex
```bash
cd ~/mission-control
npx convex dev
```

Esto abre browser para login → crea proyecto → genera archivos en `convex/_generated/`

### 2. Configurar Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=<tu-convex-url>  # Lo da Convex después del setup
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Correr el stack completo

**Terminal 1: Convex Backend**
```bash
npx convex dev
```

**Terminal 2: Next.js UI**
```bash
npm run dev
```

**Terminal 3: Simulador de Agentes**
```bash
node simulate-agents.js
```

### 5. Abrir Dashboard
```
http://localhost:3000
```

¡Deberías ver agentes actualizándose en vivo! 🎉

---

## 🤖 Usar con Claude Code

**Copiar prompt:**
```bash
cat CLAUDE_CODE_PROMPT.txt | pbcopy  # macOS
cat CLAUDE_CODE_PROMPT.txt | xclip   # Linux
```

**Pegar en Claude Code:**
```bash
claude code
# Pega el prompt y presiona Enter
```

Claude Code creará agentes (Franky, Robin, Reigen) y coordinará el trabajo.

---

## 📊 Qué ver en el Dashboard

- **Agent Cards**: Grid de todos los agentes con status actual
- **Activity Feed**: Stream de actividades en tiempo real
- **Task Board**: Kanban de tareas (drag & drop)
- **Isometric Map**: Visualización 3D de agentes

### Status Indicators
- 🟢 **Working** - Agente ejecutando tarea
- 🟡 **Idle** - Agente esperando
- ✅ **Done** - Tarea completada
- 🔴 **Blocked** - Agente bloqueado

---

## 🔌 Conectar Agentes OpenClaw Reales

En tu agente (ej. Hoyuelo):

```typescript
// En tu código OpenClaw
async function reportToMissionControl(status: string, task?: string) {
  await fetch("http://localhost:3000/api/convex/agent/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionKey: "hoyuelo-main",  // Tu session key
      status,
      currentTask: task
    })
  });
}

// Úsalo en tu workflow
await reportToMissionControl("working", "Processing emails");
// ... hace el trabajo ...
await reportToMissionControl("done");
```

---

## 🐛 Troubleshooting

### "Convex not initialized"
```bash
npx convex dev
# Sigue el wizard de setup
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### "Agent updates not showing"
1. Verifica que `simulate-agents.js` esté corriendo
2. Revisa consola del navegador (F12)
3. Verifica que Convex backend esté corriendo (`npx convex dev`)

---

## 📝 Archivos Importantes

- `convex/schema.ts` - Schema de la base de datos
- `convex/agents.ts` - Queries/mutations para agentes
- `convex/http.ts` - API HTTP para agentes externos
- `src/app/page.tsx` - Dashboard principal
- `simulate-agents.js` - Simulador de actividad

---

## 🎯 Next Steps

1. ✅ **Ver funcionar el simulador** - Entender cómo fluye la data
2. ✅ **Conectar un agente real** - Hoyuelo reportando status
3. ✅ **Personalizar UI** - Ajustar el tema Danganronpa
4. ✅ **Deploy** - Subir a Railway + Convex Cloud
5. ✅ **Aplicar a Convex for Claw** - 1 año Pro gratis

---

## 🦞 Tips

- **Real-time es automático**: Solo usa `useQuery`, Convex hace el resto
- **No hagas polling**: Convex actualiza cuando cambia data
- **TypeScript types**: Auto-generados en `convex/_generated/`
- **Debug**: Dashboard de Convex en https://dashboard.convex.dev

---

**¿Problemas?** Revisa:
- Logs de Convex: Terminal donde corre `npx convex dev`
- Logs del browser: DevTools → Console (F12)
- Docs: https://docs.convex.dev

¡Disfruta viendo tus agentes trabajar! 🚀
