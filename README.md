# Progressor

Aplicación web para cargar y visualizar rutinas de gimnasio.

## Stack

- **Next.js 16** — App Router, Server Actions
- **TypeScript**
- **Tailwind CSS v4**
- **Drizzle ORM** + **better-sqlite3** — base de datos SQLite local

## Estructura del proyecto

```
progressor/
├── app/                          # Rutas de Next.js (App Router)
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página principal — lista de rutinas
│   └── routines/
│       ├── new/
│       │   └── page.tsx          # Formulario para crear una rutina
│       └── [id]/
│           └── page.tsx          # Vista detalle de una rutina
│
├── components/
│   ├── RoutineForm.tsx           # Formulario dinámico anidado (Client Component)
│   └── RoutineCard.tsx           # Tarjeta de rutina con acción de eliminar
│
├── db/
│   └── schema.ts                 # Definición de tablas con Drizzle ORM
│
├── lib/
│   ├── db.ts                     # Conexión a SQLite + creación de tablas al inicio
│   └── actions.ts                # Server Actions: crear, listar, ver y eliminar rutinas
│
├── drizzle.config.ts             # Configuración de Drizzle Kit
├── next.config.ts                # Configuración de Next.js
├── progressor.db                 # Base de datos SQLite (generada en runtime)
└── package.json
```

## Modelo de datos

```
Routine
  └── Day (3–6 por rutina)
        └── ExerciseType  (Pull, Push, Pierna, etc.)
              └── Exercise
                    └── Set (peso en kg/lbs + repeticiones)
```

## Instalación y uso

```bash
npm install
npm run dev
```

La base de datos `progressor.db` se crea automáticamente en la primera ejecución. No requiere migraciones manuales.

## Funcionalidades (MVP)

- Crear rutinas con nombre, cantidad de días (3–6) y contenido completo
- Por día: uno o más tipos de ejercicio con nombre libre
- Por tipo de ejercicio: uno o más ejercicios
- Por ejercicio: series con peso (kg o lbs) y repeticiones
- Visualizar rutinas con toda la información organizada
- Eliminar rutinas
