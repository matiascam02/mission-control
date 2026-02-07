# 🚀 Mission Control - Convex Migration

Este archivo contiene las instrucciones para migrar Mission Control de Supabase a Convex.

## 📋 Pre-requisitos

1. ✅ Convex package instalado (`npm install convex`)
2. ✅ Archivos creados en `/convex/`
3. ⏳ Cuenta de Convex (próximo paso)

---

## 🔧 Setup de Convex

### 1. Crear cuenta e inicializar proyecto

```bash
cd /tmp/mission-control  # O donde tengas el repo
npx convex dev
```

Esto va a:
- Pedirte login (crea cuenta si no tienes)
- Crear un nuevo proyecto Convex
- Generar archivos en `convex/_generated/`
- Darte tu **Convex Team ID** (necesario para aplicar al programa)

### 2. Obtener tu Team ID

Después del login, ve a:
- **Dashboard**: https://dashboard.convex.dev
- Click en tu team (arriba izquierda)
- **Team Settings** → Copia el **Team ID**

---

## 📝 Aplicar a Convex for Claw

Una vez tengas tu cuenta y Team ID, aplica aquí:
👉 https://www.convex.dev/claw/apply

**Info que necesitas:**
- **Nombre**: Matias Cam
- **Email**: (el mismo que usaste en Convex)
- **LinkedIn**: tu-perfil-linkedin
- **Twitter**: @tu_handle (opcional)
- **Convex Team ID**: [copiado del dashboard]
- **Proyecto**: Mission Control
- **Descripción**: 
  ```
  Mission Control es un dashboard en tiempo real para coordinar squads de agentes OpenClaw.
  Usa Convex para:
  - Sincronización real-time de status de agentes
  - Activity feed en vivo
  - Kanban board reactivo para tareas
  - Chat y comunicación entre agentes
  
  El proyecto integra OpenClaw con un UI estilo Danganronpa para visualizar y gestionar
  múltiples agentes AI trabajando en conjunto.
  
  Repo: https://github.com/matiascam02/mission-control
  Demo: https://mission-control-web-production.up.railway.app
  ```

---

## 🔄 Migrar el Frontend

### 1. Instalar Convex React hooks

Ya está instalado con `npm install convex`.

### 2. Configurar ConvexProvider

Edita `src/app/layout.tsx`:

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
```

### 3. Usar queries reactivas

En lugar de esto (Supabase):
```tsx
const { data, error } = await supabase.from('agents').select('*');
```

Haz esto (Convex):
```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const agents = useQuery(api.agents.list);
// ✅ Reactivo automáticamente
// ✅ TypeScript types automáticos
// ✅ Loading/error states manejados
```

### 4. Usar mutations

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const updateStatus = useMutation(api.agents.updateStatus);

// Llamarlo:
await updateStatus({ id: agentId, status: "working" });
// ✅ Se actualiza en todos los clientes automáticamente
```

---

## 🎯 Próximos Pasos

1. **Ahora**: Corre `npx convex dev` y crea tu cuenta
2. **Luego**: Aplica a Convex for Claw con tu Team ID
3. **Después**: Migra componente por componente a Convex
4. **Finalmente**: Deploy a producción con `npx convex deploy`

---

## 💡 Ventajas vs Supabase

✅ **Real-time nativo** - Todo es reactivo por defecto
✅ **TypeScript end-to-end** - Tipos automáticos en frontend y backend
✅ **Menos boilerplate** - No más `const { data, error }` en cada query
✅ **Mejor DX** - Hot reload, local dev con `convex dev`
✅ **Gratis** - Free tier generoso (1M function calls/mes)

---

## 🆘 Ayuda

- **Docs**: https://docs.convex.dev
- **Discord**: https://convex.dev/community
- **Ejemplos**: https://github.com/get-convex

¿Problemas? Pregúntame! 🦞
