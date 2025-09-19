import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Edit, Trash2, Eye, ExternalLink, Map } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../api/axios";

export default function ParkCard({ park, onParkDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Obtiene la URL de imagen según los requisitos de la API
   * Prioridad: park_img_url -> park_img_uri (servidor) -> fallback
   */
  const getImageUrl = () => {
    // Si hay park_img_url y no hubo error, usarla
    if (park.park_img_url && !imageError) {
      return park.park_img_url;
    }
    
    // Si hay park_img_uri, construir la URL del servidor según requisitos
    if (park.park_img_uri && !imageError) {
      return `https://azuritaa33.sg-host.com/storage/${park.park_img_uri}`;
    }
    
    // Fallback a imagen por defecto
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80';
  };

  /**
   * Función de eliminación con Sweet Alert y manejo robusto de errores
   * Cumple con manejo de errores 404 según documentación API
   */
  const handleDeleteClick = async () => {
    // Validar conectividad
    if (!navigator.onLine) {
      return Swal.fire({
        icon: 'warning',
        title: 'Sin conexión',
        text: 'Verifica tu conexión a internet para eliminar el parque',
        confirmButtonColor: '#dc2626'
      });
    }

    // Confirmación con información detallada del parque
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar parque?',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Parque:</strong> ${park.park_name}</p>
          <p><strong>Abreviación:</strong> ${park.park_abbreviation}</p>
          <p><strong>Ubicación:</strong> ${park.park_city}, ${park.park_state}</p>
          <p><strong>Dirección:</strong> ${park.park_address}</p>
          <p class="text-red-600 text-sm mt-3">
            <strong>⚠️ Esta acción no se puede deshacer</strong>
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      focusCancel: true, // Enfoca en cancelar por seguridad
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);

    // Mostrar progreso de eliminación
    Swal.fire({
      title: 'Eliminando parque...',
      html: `Eliminando <strong>${park.park_name}</strong> del sistema`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      // DELETE request según documentación API
      await api.delete(`/parks/${park.id}`, {
        timeout: 15000, // Timeout más generoso
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Éxito - respuesta 204 No Content según documentación
      await Swal.fire({
        icon: 'success',
        title: '¡Parque eliminado exitosamente!',
        html: `<strong>${park.park_name}</strong> ha sido eliminado del sistema`,
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
      });

      // Notificar al componente padre para actualizar la lista
      if (onParkDeleted) {
        onParkDeleted(park.id);
      }

    } catch (error) {
      console.error('Error al eliminar parque:', error);

      let errorConfig = {
        icon: 'error',
        title: 'Error al eliminar',
        text: 'No se pudo eliminar el parque'
      };

      // Manejo específico de errores según documentación API
      if (error.response?.status === 404) {
        errorConfig.title = 'Parque no encontrado';
        errorConfig.text = 'El parque ya no existe o fue eliminado previamente';
      } else if (error.response?.status === 403) {
        errorConfig.title = 'Sin permisos';
        errorConfig.text = 'No tienes permisos para eliminar este parque';
      } else if (error.response?.status === 401) {
        errorConfig.title = 'No autorizado';
        errorConfig.text = 'Tus credenciales han expirado. Actualiza la página';
      } else if (error.response?.status === 500) {
        errorConfig.title = 'Error del servidor';
        errorConfig.text = 'Hubo un problema en el servidor. Intenta más tarde';
      } else if (error.code === 'ECONNABORTED') {
        errorConfig.title = 'Tiempo agotado';
        errorConfig.text = 'La eliminación tardó demasiado tiempo. Verifica tu conexión';
      } else if (error.response?.data?.message) {
        errorConfig.text = error.response.data.message;
      } else if (!navigator.onLine) {
        errorConfig.title = 'Sin conexión';
        errorConfig.text = 'Se perdió la conexión a internet durante la eliminación';
      }

      // Mostrar error con opción de reintentar
      const retry = await Swal.fire({
        ...errorConfig,
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280'
      });

      if (retry.isConfirmed) {
        handleDeleteClick(); // Reintentar eliminación
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Función para compartir parque con datos completos
   */
  const handleShare = async () => {
    const shareData = {
      title: `${park.park_name} - ${park.park_city}`,
      text: `Conoce ${park.park_name} en ${park.park_city}, ${park.park_state}. ${park.park_address}`,
      url: `${window.location.origin}/parks/${park.id}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        
        Swal.fire({
          icon: 'success',
          title: '¡Copiado!',
          text: 'Información del parque copiada al portapapeles',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Swal.fire({
        icon: 'info',
        title: 'No se pudo compartir',
        text: 'Copia el enlace manualmente desde la barra de direcciones',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  /**
   * Mostrar coordenadas en mapa
   */
  const showOnMap = () => {
    if (park.park_latitude && park.park_longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${park.park_latitude},${park.park_longitude}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Coordenadas no disponibles',
        text: 'Este parque no tiene coordenadas registradas',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative group">
      
      {/* Overlay de eliminación */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-red-200 border-t-red-600 mx-auto mb-3"></div>
            <p className="text-red-600 font-semibold">Eliminando parque...</p>
            <p className="text-red-500 text-sm">Por favor espera</p>
          </div>
        </div>
      )}

      {/* Imagen con carga progresiva según requisitos */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <div className="text-gray-500 text-sm">Cargando imagen...</div>
            </div>
          </div>
        )}
        
        <img
          src={getImageUrl()}
          alt={`Imagen del parque ${park.park_name}`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.warn('Error cargando imagen para parque:', park.id, getImageUrl());
            if (!imageError) {
              setImageError(true);
              // Trigger re-render to use fallback
              setImageLoaded(false);
              setTimeout(() => setImageLoaded(true), 100);
            }
          }}
          loading="lazy" // Optimización de carga
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badge de abreviación (campo requerido por API) */}
        {park.park_abbreviation && (
          <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {park.park_abbreviation}
          </div>
        )}

        {/* Controles flotantes */}
        <div className="absolute top-3 left-3 flex space-x-2">
          <button
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            title={`Compartir ${park.park_name}`}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {park.park_latitude && park.park_longitude && (
            <button
              onClick={showOnMap}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
              title="Ver en mapa"
            >
              <Map className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Información principal */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" title={park.park_name}>
            {park.park_name}
          </h2>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-emerald-600" />
            <span className="truncate">
              {park.park_city}, {park.park_state}
            </span>
          </div>
          
          {park.park_address && (
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed" title={park.park_address}>
              📍 {park.park_address}
            </p>
          )}
        </div>

        {/* Información adicional - datos requeridos por API */}
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4 py-2 border-t border-gray-100">
          <span className="font-mono">ID: {park.id}</span>
          {park.park_zip_code && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              CP: {park.park_zip_code}
            </span>
          )}
        </div>

        {/* Botones de acción CRUD */}
        <div className="flex gap-2">
          <Link
            to={`/parks/${park.id}`}
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            <span>Ver detalles</span>
          </Link>
          
          <Link
            to={`/parks/${park.id}/edit`}
            className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            title={`Editar ${park.park_name}`}
          >
            <Edit className="w-4 h-4" />
          </Link>
          
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title={`Eliminar ${park.park_name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}