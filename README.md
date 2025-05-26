# MarcelinoAPP - Control de Ingresos de Alquiler de Vehículos

Aplicación web para gestionar los ingresos de alquiler de vehículos (taxi/remise).

## Características Principales

- Registro de ingresos semanales
- Calendario interactivo para visualizar ingresos
- Configuración de días laborables
- Cálculo automático de ingresos diarios y mensuales
- Modificación de registros existentes
- Dashboard con estadísticas

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```
3. Iniciar la aplicación:
```bash
npm start
```

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes reutilizables
  ├── pages/         # Páginas principales
  ├── services/      # Servicios y llamadas a API
  ├── types/         # Definiciones de tipos TypeScript
  └── utils/         # Utilidades y helpers
```

## Tecnologías Utilizadas

- React
- TypeScript
- Material-UI
- Recharts (para gráficos)
- date-fns (para manejo de fechas) 