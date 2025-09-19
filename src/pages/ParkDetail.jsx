import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Hash, Share2, ExternalLink, Edit } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../api/axios";

export default function ParkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Obtiene la URL de imagen según requisitos de la API
   */
  const getImageUrl = (park) => {
    if (park.park_img_url && !imageError) return park.park_img_url;
    if (park.park_img_uri && !imageError) return `https://azuritaa33.sg-host.com/storage/${park.park_img_uri}`;
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&q=80';
  };

  /**
   * Cargar datos del parque con manejo de errores según documentación API
   */
  const fetchPark = async () => {
    if (!navigator.onLine) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin conexión',
        text: 'Verifica tu conexión a internet',
        confirmButtonColor: '#16a34a'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/parks/${id}`, {
        timeout: 10000,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const parkData = res.data.data || res.data;
      
      if (!parkData?.park_name) {
        throw new Error('Datos del parque incompletos');
      }
      
      setPark(parkData);
      
    } catch (error) {
      console.error("Error al obtener parque:", error);
      
      if (error.response?.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Parque no encontrado',
          text: `No existe el parque con ID: ${id}`,
          confirmButtonText: 'Volver al inicio',
          confirmButtonColor: '#16a34a',
          allowOutsideClick: false
        }).then(() => navigate('/'));
      } else if (error.response?.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Problema en el servidor. Intenta más tarde.',
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Volver',
          confirmButtonColor: '#16a34a'
        }).then((result) => {
          if (result.isConfirmed) fetchPark();
          else navigate('/');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor',
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Volver',
          confirmButtonColor: '#16a34a'
        }).then((result) => {
          if (result.isConfirmed) fetchPark();
          else navigate('/');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Compartir parque
   */
  const handleShare = async () => {
    const shareData = {
      title: park.park_name,
      text: `${park.park_name} - ${park.park_city}, ${park.park_state}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        Swal.fire({
          icon: 'success',
          title: 'Copiado al portapapeles',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  /**
   * Abrir en Google Maps
   */
  const openInMaps = () => {
    if (park.park_latitude && park.park_longitude) {
      window.open(`https://www.google.com/maps?q=${park.park_latitude},${park.park_longitude}`, '_blank');
    }
  };

  useEffect(() => {
    if (id) {
      fetchPark();
    } else {
      navigate('/');
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-green-600 absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-green-700 font-medium text-lg">Cargando parque...</p>
            <div className="w-48 h-2 bg-green-200 rounded-full mt-3 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full animate-pulse shadow-sm" style={{width: '70%'}}></div>
            </div>
            <p className="text-green-500 text-sm mt-2">ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!park) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-red-50 via-orange-50 to-white">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏞️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Parque no encontrado</h1>
          <p className="text-gray-600 mb-2">No se pudo cargar la información del parque solicitado.</p>
          <p className="text-sm text-gray-500 mb-8">ID buscado: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code></p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <button
              onClick={fetchPark}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-300 hover:scale-105"
            >
              🔄 Reintentar
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all duration-300 hover:scale-105 text-center"
            >
              🏠 Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a la lista</span>
          </Link>
          
          <div className="hidden sm:block text-sm text-gray-500">
            ID: {park.id} • {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-green-100">
          
          {/* Image Section */}
          <div className="relative h-96 bg-gradient-to-br from-green-100 to-emerald-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50/90 to-emerald-50/90">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
                  <p className="text-green-600 font-medium">Cargando imagen...</p>
                </div>
              </div>
            )}
            
            <img
              src={getImageUrl(park)}
              alt={park.park_name}
              className={`h-full w-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } hover:scale-105 cursor-pointer`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                if (!imageError) {
                  setImageError(true);
                  e.target.src = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&q=80';
                }
              }}
              onClick={() => {
                Swal.fire({
                  imageUrl: getImageUrl(park),
                  imageWidth: '100%',
                  imageHeight: 'auto',
                  imageAlt: park.park_name,
                  showConfirmButton: false,
                  showCloseButton: true,
                  background: 'rgba(0,0,0,0.9)',
                  backdrop: 'rgba(0,0,0,0.8)'
                });
              }}
            />
            
            {/* Overlay with title */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg mb-3">
                {park.park_name}
              </h1>
              <div className="flex items-center text-green-100 text-xl mb-4">
                <MapPin className="w-6 h-6 mr-2" />
                <span>{park.park_city}, {park.park_state}</span>
              </div>
              {park.park_abbreviation && (
                <div className="inline-block bg-green-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-green-300/30">
                  <span className="text-green-100 text-lg font-bold">{park.park_abbreviation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* General Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700">Información General</h2>
                </div>
                
                <div className="space-y-4">
                  {park.park_abbreviation && (
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                      <span className="text-gray-600 font-medium">Abreviación:</span>
                      <span className="font-bold text-gray-800 bg-green-100 px-3 py-1 rounded-full text-sm">
                        {park.park_abbreviation}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start py-3 border-b border-green-100">
                    <span className="text-gray-600 font-medium">Dirección:</span>
                    <span className="font-semibold text-gray-800 text-right max-w-xs">
                      {park.park_address || 'No especificada'}
                    </span>
                  </div>
                  
                  {park.park_zip_code && (
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                      <span className="text-gray-600 font-medium">Código Postal:</span>
                      <span className="font-semibold text-gray-800">{park.park_zip_code}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Ciudad/Estado:</span>
                    <span className="font-semibold text-gray-800">{park.park_city}, {park.park_state}</span>
                  </div>
                </div>
              </div>
              
              {/* Location Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-blue-700">Ubicación</h2>
                </div>
                
                <div className="space-y-4">
                  {park.park_latitude && (
                    <div className="flex justify-between items-center py-3 border-b border-blue-100">
                      <span className="text-gray-600 font-medium">Latitud:</span>
                      <span className="font-mono text-gray-800 bg-blue-100 px-3 py-1 rounded-full text-sm">
                        {parseFloat(park.park_latitude).toFixed(6)}°
                      </span>
                    </div>
                  )}
                  
                  {park.park_longitude && (
                    <div className="flex justify-between items-center py-3 border-b border-blue-100">
                      <span className="text-gray-600 font-medium">Longitud:</span>
                      <span className="font-mono text-gray-800 bg-blue-100 px-3 py-1 rounded-full text-sm">
                        {parseFloat(park.park_longitude).toFixed(6)}°
                      </span>
                    </div>
                  )}
                  
                  {park.park_latitude && park.park_longitude && (
                    <div className="pt-4">
                      <button
                        onClick={openInMaps}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>Ver en Google Maps</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 px-6 sm:px-8 py-6 border-t border-green-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">
                  Parque #{park.id} • {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
                
                <Link
                  to="/"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}