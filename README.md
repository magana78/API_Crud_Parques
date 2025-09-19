# Sistema de Gestión de Parques 🏞️

Una aplicación web moderna desarrollada en React para la administración completa de parques urbanos. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) a través de una API RESTful, con una interfaz intuitiva y responsiva.

## 📋 Descripción del Proyecto

Este sistema fue desarrollado como parte de una prueba técnica para consumir una API RESTful de gestión de parques. La aplicación permite a los usuarios administrar información detallada de parques, incluyendo ubicación, coordenadas geográficas, imágenes y datos de contacto.

### Características principales:
- **Gestión completa de parques** con operaciones CRUD
- **Interfaz moderna** con diseño responsivo
- **Carga optimizada de imágenes** con fallbacks automáticos
- **Integración con mapas** para visualización de coordenadas
- **Manejo robusto de errores** con notificaciones amigables
- **Validación de formularios** según especificaciones de la API
- **Funciones de compartir** y navegación intuitiva

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca principal para la UI
- **React Router DOM** - Navegación entre páginas
- **Vite** - Herramienta de desarrollo y build
- **Tailwind CSS** - Framework de estilos utilitarios

### Dependencias principales
- **Axios** - Cliente HTTP para consumo de API
- **SweetAlert2** - Alertas y modales elegantes
- **Lucide React** - Iconos SVG modernos

### API
- **Laravel RESTful API** - Backend para gestión de datos
- **Autenticación por headers** - Sistema de claves públicas/privadas

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Navegador web moderno

### Pasos de instalación

1. **Clonar el repositorio:**
```bash
git clone <tu-repositorio-url>
cd sistema-gestion-parques
```

2. **Instalar dependencias:**
```bash
npm install
# o si usas yarn
yarn install
```

3. **Configurar variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
VITE_API_BASE_URL=https://azuritaa33.sg-host.com/api/web/v1
VITE_API_PUBLIC_KEY=AMBU-T-BXiqUTFtRg8PbWLc-57055915-n59AHW
VITE_API_PRIVATE_KEY=AMBU-fVN0VyresedITDPm7pvGrjnb2urUxlR0EKsS1qc86T4VEWP6-VFZ4N83UcrKS357V-T
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
# o si usas yarn
yarn dev
```

5. **Abrir en el navegador:**
La aplicación estará disponible en `http://localhost:5173`

### Comandos disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa de build de producción
npm run lint         # Ejecuta ESLint para revisar código
```

## 📱 Funcionalidades

### 🏠 Página Principal (Home)
- **Lista de parques** en formato de tarjetas responsivas
- **Botón de actualización** para refrescar datos
- **Navegación rápida** a crear nuevo parque
- **Contador dinámico** de parques disponibles
- **Estados de carga** con animaciones suaves

### 📋 Gestión de Parques (CRUD)

#### ✅ **Listar Parques (READ)**
- Visualización en grid responsivo
- Información resumida por tarjeta
- Imágenes optimizadas con carga progresiva
- Estados de error y carga elegantes

#### ➕ **Crear Parque (CREATE)**
- Formulario completo con validaciones
- Campos requeridos según API:
  - Nombre del parque
  - Abreviación (única, máx. 10 caracteres)
  - URL de imagen (JPG, JPEG, PNG)
  - Dirección completa
  - Ciudad (Zapopan, Guadalajara, San Pedro Tlaquepaque, Tonalá)
  - Estado (Jalisco)
  - Código postal
  - Coordenadas (latitud/longitud)

#### 👁️ **Ver Detalles (READ)**
- Modal o página dedicada con información completa
- Visualización de imagen a tamaño completo
- Datos técnicos y de ubicación
- Botón para ver en Google Maps

#### ✏️ **Editar Parque (UPDATE)**
- Formulario pre-cargado con datos existentes
- Validación de cambios
- Actualización parcial o completa
- Confirmación de cambios

#### 🗑️ **Eliminar Parque (DELETE)**
- Confirmación con datos del parque
- Proceso de eliminación con feedback visual
- Manejo de errores (parque no encontrado, etc.)
- Actualización automática de la lista

### 🌟 Características Adicionales

#### 🖼️ **Manejo de Imágenes**
- **Sistema de prioridad:** URL externa → Servidor interno → Imagen por defecto
- **Carga progresiva** con estados de loading
- **Fallbacks automáticos** en caso de error
- **Optimización** para diferentes tamaños de pantalla

#### 🗺️ **Integración con Mapas**
- Botón para abrir ubicación en Google Maps
- Uso de coordenadas precisas del parque
- Validación de existencia de coordenadas

#### 📱 **Funciones Sociales**
- **Compartir parque** via Web Share API
- **Fallback a clipboard** en dispositivos no compatibles
- Información completa para compartir

#### ⚠️ **Manejo de Errores**
- **Errores de red:** Sin conexión, timeout
- **Errores de API:** 404, 422, 500, etc.
- **Validaciones:** Campos requeridos, formatos
- **Reintentos automáticos** con confirmación del usuario

## 🏗️ Estructura del Proyecto

```
src/
├── api/                    # Configuración de Axios
│   └── axios.js           # Cliente HTTP configurado
├── components/            # Componentes reutilizables
│   ├── DeleteConfirmationModal.jsx
│   ├── ParkCard.jsx       # Tarjeta de parque
│   ├── ParkEditForm.jsx   
│   ├── ParkForm.jsx       
│   └── ParkList.jsx       
├── hooks/                 # Hooks personalizados
│   └── useDeletePark.js   # Hook para eliminación
├── pages/                 # Páginas principales
│   ├── Home.jsx           # Lista de parques
│   └── ParkDetail.jsx     # Vista detallada
├── assets/                # Recursos estáticos
├── App.jsx               # Componente raíz
├── index.css             # Estilos globales
└── main.jsx              # Punto de entrada
## 🌐 API Endpoints

La aplicación consume los siguientes endpoints:

- `GET /parks` - Listar todos los parques
- `GET /parks/{id}` - Obtener parque específico
- `POST /parks` - Crear nuevo parque
- `PUT /parks/{id}` - Actualizar parque existente
- `DELETE /parks/{id}` - Eliminar parque

### Headers requeridos:
```json
{
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Ambu-Public-Key": "AMBU-T-BXiqUTFtRg8PbWLc-57055915-n59AHW",
  "Ambu-Private-Key": "AMBU-fVN0VyresedITDPm7pvGrjnb2urUxlR0EKsS1qc86T4VEWP6-VFZ4N83UcrKS357V-T"
}
```

## 📝 Validaciones y Reglas

### Campos obligatorios:
- **park_name:** Texto, máximo 100 caracteres
- **park_abbreviation:** Texto, máximo 10 caracteres, único
- **park_img_url:** URL válida de imagen (JPG, JPEG, PNG)
- **park_address:** Texto, máximo 150 caracteres
- **park_city:** Debe ser uno de: "Zapopan", "Guadalajara", "San Pedro Tlaquepaque", "Tonalá"
- **park_state:** Texto, máximo 100 caracteres
- **park_zip_code:** Número entero
- **park_latitude:** Número decimal
- **park_longitude:** Número decimal

## 🎨 Características de UI/UX

### Diseño Responsivo
- **Mobile first:** Optimizado para dispositivos móviles
- **Breakpoints:** sm, md, lg, xl para diferentes pantallas
- **Grid adaptativo:** Ajuste automático de columnas

### Animaciones y Transiciones
- **Hover effects:** Escalado y sombras suaves
- **Loading states:** Spinners y esqueletos elegantes
- **Staggered animations:** Aparición progresiva de elementos
- **Micro-interactions:** Feedback inmediato a acciones del usuario

### Accesibilidad
- **Contraste adecuado** en todos los elementos
- **Navegación por teclado** funcional
- **Alt text** en imágenes
- **ARIA labels** en botones y controles

## 🔧 Solución de Problemas

### Errores comunes:

**Error de CORS:**
- Verificar que la API permita requests desde localhost
- Confirmar headers de autenticación

**Imágenes no cargan:**
- Verificar URLs de imágenes externas
- Comprobar conectividad de red

**Formulario no envía:**
- Validar que todos los campos requeridos estén llenos
- Verificar formato de coordenadas (números decimales)
- Confirmar que la ciudad esté en la lista válida


