@AGENTS.md

# Progressor — contexto para Claude Code

## Qué es este proyecto

Aplicación web para cargar y visualizar rutinas de gimnasio. MVP con Next.js, SQLite y Drizzle ORM.

## Stack

- **Next.js 16** con App Router y Server Actions (no Pages Router, no API routes)
- **TypeScript** estricto
- **Tailwind CSS v4** — sintaxis puede diferir de v3, revisar `node_modules/tailwindcss/` ante dudas
- **Drizzle ORM** + **better-sqlite3** — base de datos local en `progressor.db`

## Archivos clave

| Archivo | Rol |
|---|---|
| `db/schema.ts` | Definición de tablas (fuente de verdad del modelo) |
| `db/client.ts` | Conexión SQLite + creación de tablas al arranque |
| `lib/actions.ts` | Toda la lógica de datos: Server Actions para crear, leer y eliminar |
| `lib/routes.ts` | Constantes de navegación |
| `lib/workout/weeklyProgress.ts` | Lógica de dominio: cálculo de progreso semanal |
| `components/RoutineForm.tsx` | Formulario dinámico anidado (Client Component) |
| `app/page.tsx` | Lista de rutinas |
| `app/routines/new/page.tsx` | Crear rutina |
| `app/routines/[id]/page.tsx` | Ver rutina |

## Modelo de datos

```
routines → days → exercise_types → exercises → sets
```

- Una rutina tiene entre 3 y 6 días
- Cada día tiene N tipos de ejercicio (Pull, Push, Pierna, etc.)
- Cada tipo tiene N ejercicios
- Cada ejercicio tiene N series con `weight` (real), `weight_unit` (kg | lbs) y `reps`

## Convenciones

- Las mutaciones van en `lib/actions.ts` como Server Actions (`"use server"`)
- Los componentes que usan estado o eventos del browser son Client Components (`"use client"`)
- El resto son Server Components por defecto
- No usar `useEffect` para fetching — usar Server Components y `async/await` directamente
- Estilos solo con clases de Tailwind, sin CSS custom salvo `app/globals.css` — nunca usar el atributo `style` inline
- El esquema de la base de datos se modifica en `db/schema.ts` y se refleja en `db/client.ts` (DDL inline al arranque)

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run lint     # ESLint
```
