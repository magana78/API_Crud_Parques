import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'; // AGREGAR: Sweet Alert para manejo de errores
import api from "../api/axios";
import ParkCard from "../components/ParkCard";

export default function Home() {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderErrors, setRenderErrors] = useState([]);
  const location = useLocation();

  /**
   * Hook personalizado para manejar la carga de parques
   * Incluye validación de conectividad y manejo de errores con SweetAlert
   */
  const fetchParks = useCallback(async () => {
    // Validar estado de conexión antes de hacer petición
    if (!navigator.onLine) {
      // Mostrar alerta de conectividad con SweetAlert
      Swal.fire({
        icon: 'warning',
        title: 'Sin conexión a internet',
        text: 'Verifica tu conexión y vuelve a intentar',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#16a34a'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("=== INICIANDO GET REQUEST ===");
      console.log("URL completa:", `${api.defaults.baseURL}/`);
      console.log("Headers:", api.defaults.headers);
      
      // Petición GET con headers anti-cache para datos frescos
      const res = await api.get("/parks", {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Timestamp único para forzar requests frescos
        params: {
          _t: new Date().getTime()
        }
      });
      
      console.log("=== RESPUESTA RECIBIDA ===");
      console.log("Status:", res.status);
      console.log("Headers de respuesta:", res.headers);
      console.log("Data completa:", res.data);
      console.log("Estructura de data:", typeof res.data, Object.keys(res.data));
      
      // Extraer datos con fallback seguro para diferentes estructuras de API
      const parks = res.data.data || res.data || [];
      console.log("Parques extraídos:", parks);
      console.log("Cantidad:", parks.length);
      console.log("IDs:", parks.map(p => p.id));
      console.log("Nombres:", parks.map(p => p.park_name));
      
      setParks(parks);
      
      // Mostrar notificación de éxito solo si hay parques
      if (parks.length > 0) {
        Swal.fire({
          icon: 'success',
          title: '¡Parques cargados!',
          text: `Se cargaron ${parks.length} parque(s) exitosamente`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
      
    } catch (error) {
      console.error("=== ERROR EN GET ===");
      console.error("Error completo:", error);
      console.error("Response error:", error.response);
      
      // Manejo centralizado de errores con SweetAlert
      // Permite al usuario reintentar o cancelar
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar parques',
        text: error.response?.data?.message || 'No se pudieron cargar los parques. Verifica tu conexión a internet.',
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#dc2626'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchParks(); // Reintentar automáticamente
        }
      });
      
      setParks([]);
    } finally {
      // Siempre ocultar loading sin importar el resultado
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParks();
  }, [fetchParks]);

  // Refrescar cuando se regresa de crear parque con validación
  useEffect(() => {
    if (location.state?.refresh || location.pathname === '/') {
      console.log("Refrescando lista por navegación");
      fetchParks();
    }
  }, [location, fetchParks]);

  /**
   * Función para renderizar parque individual con manejo robusto de errores
   * Valida campos requeridos y maneja excepciones de renderizado
   */
  const renderParkCard = (park, index) => {
    try {
      // Validar que el parque tenga todos los campos necesarios
      if (!park.id || !park.park_name || !park.park_city || !park.park_state) {
        console.warn('Parque con datos faltantes:', park);
        
        // Mostrar tarjeta de error amigable
        return (
          <div key={`incomplete-${park.id || index}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-yellow-800 font-medium">⚠️ Datos incompletos</h3>
            <p className="text-yellow-600 text-sm">{park.park_name || 'Parque sin nombre'}</p>
            <p className="text-yellow-500 text-xs mt-1">Algunos datos están faltando</p>
          </div>
        );
      }
     
      return <ParkCard key={park.id} park={park} />;
    } catch (error) {
      console.error(`Error renderizando parque ${park.id}:`, error);
      setRenderErrors(prev => [...prev, { id: park.id, error: error.message }]);
     
      // Tarjeta de error más estilizada
      return (
        <div key={`error-${park.id}`} className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-red-800 font-medium">🚫 Error de renderizado</h3>
          <p className="text-red-600 text-sm">{park.park_name || 'Nombre no disponible'}</p>
          <p className="text-red-500 text-xs mt-1">ID: {park.id}</p>
          <p className="text-red-400 text-xs">Error: {error.message}</p>
        </div>
      );
    }
  };

  // Loading mejorado con animaciones más atractivas
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner doble más elaborado */}
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-green-600 absolute top-0 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          {/* Texto animado */}
          <div className="text-center animate-pulse">
            <p className="text-green-700 font-medium text-lg">Cargando parques...</p>
            <div className="w-48 h-2 bg-green-200 rounded-full mt-3 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full animate-pulse shadow-sm" style={{width: '70%'}}></div>
            </div>
            <p className="text-green-500 text-sm mt-2">Obteniendo datos frescos del servidor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header responsive mejorado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
          <div className="animate-fadeInLeft">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-700 drop-shadow-lg">
              Lista de Parques
            </h1>
            <p className="text-green-600 text-lg mt-1">
              {parks.length} parque{parks.length !== 1 ? 's' : ''} disponible{parks.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Botones de acción responsive MEJORADOS */}
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-3 w-full sm:w-auto animate-fadeInRight">
            <button
              onClick={() => {
                console.log("Refrescando manualmente...");
                Swal.fire({
                  icon: 'info',
                  title: 'Actualizando...',
                  text: 'Obteniendo los datos más recientes',
                  timer: 1500,
                  showConfirmButton: false
                });
                fetchParks();
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-400/30 hover:scale-105 flex items-center justify-center space-x-3 font-medium border border-gray-500/20"
            >
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <svg className="w-5 h-5 animate-spin group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="relative z-10">Actualizar</span>
            </button>
            
            <Link
              to="/parks/new"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-400/40 hover:scale-105 flex items-center justify-center space-x-3 font-semibold border border-emerald-400/30"
            >
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Icono animado */}
              <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="relative z-10">Crear Nuevo Parque</span>
              
              {/* Partículas decorativas */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
            </Link>
          </div>
        </div>

        {/* Información de estado - versión amigable solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && parks.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/60 rounded-2xl shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Estadísticas principales */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">
                    {parks.length} parque{parks.length !== 1 ? 's' : ''} activo{parks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-emerald-700 text-sm">
                    Actualizado {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Estado de conexión */}
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  navigator.onLine 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    navigator.onLine ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  <span className="font-medium">
                    {navigator.onLine ? 'En línea' : 'Sin conexión'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de errores de renderizado */}
        {renderErrors.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm animate-slideDown">
            <h3 className="text-yellow-800 font-medium flex items-center">
              ⚠️ Advertencias de renderizado
            </h3>
            <p className="text-yellow-700 text-sm mt-1">
              {renderErrors.length} parque(s) con problemas de visualización
            </p>
            <button
              onClick={() => setRenderErrors([])}
              className="text-yellow-600 hover:text-yellow-800 text-xs underline mt-2"
            >
              Ocultar advertencias
            </button>
          </div>
        )}
       
        {/* Contenido principal */}
        {parks.length === 0 ? (
          <div className="text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-4">🏞️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">No hay parques disponibles</h2>
            <p className="text-gray-600 text-lg mb-6">¡Sé el primero en agregar un parque!</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={fetchParks}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-green-400/30 hover:scale-105 flex items-center justify-center space-x-3 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="relative z-10">Recargar</span>
              </button>
              
              <Link
                to="/parks/new"
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-400/30 hover:scale-105 flex items-center justify-center space-x-3 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="relative z-10">Crear Primer Parque</span>
              </Link>
            </div>
          </div>
        ) : (
          // Grid de parques con animaciones stagger
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {parks.map((park, index) => (
              <div 
                key={park.id}
                className="animate-fadeInUp hover:scale-105 transition-transform duration-300"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {renderParkCard(park, index)}
              </div>
            ))}
          </div>
        )}

        {/* Footer con información adicional */}
        {parks.length > 0 && (
          <div className="mt-12 text-center text-gray-500 text-sm animate-fadeIn">
            <p>Mostrando {parks.length} parque{parks.length !== 1 ? 's' : ''} • Última actualización: {new Date().toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}