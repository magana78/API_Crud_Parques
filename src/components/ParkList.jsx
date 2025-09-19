import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Grid, List, MapPin } from "lucide-react";
import ParkCard from "./ParkCard";

export default function ParkList({ parks, onParksUpdate }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'city', 'recent'

  // Obtener ciudades únicas para el filtro
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(parks.map(park => park.park_city))].filter(Boolean);
    return uniqueCities.sort();
  }, [parks]);

  // Filtrar y ordenar parques
  const filteredAndSortedParks = useMemo(() => {
    let filtered = parks.filter(park => {
      const matchesSearch = !searchTerm || 
        park.park_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        park.park_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        park.park_state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        park.park_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !filterCity || park.park_city === filterCity;
      
      return matchesSearch && matchesCity;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'city':
          return (a.park_city || '').localeCompare(b.park_city || '');
        case 'recent':
          return (b.id || 0) - (a.id || 0); // Asumiendo que ID mayor = más reciente
        case 'name':
        default:
          return (a.park_name || '').localeCompare(b.park_name || '');
      }
    });

    return filtered;
  }, [parks, searchTerm, filterCity, sortBy]);

  /**
   * Maneja la eliminación de un parque
   */
  const handleParkDeleted = (deletedParkId) => {
    if (onParksUpdate) {
      const updatedParks = parks.filter(park => park.id !== deletedParkId);
      onParksUpdate(updatedParks);
    }
  };

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCity('');
    setSortBy('name');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parques de Jalisco
          </h1>
          <p className="text-gray-600">
            {filteredAndSortedParks.length} de {parks.length} parque{parks.length !== 1 ? 's' : ''}
            {searchTerm || filterCity ? ' (filtrado)' : ''}
          </p>
        </div>
        
        <Link
          to="/parks/new"
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Agregar Parque</span>
        </Link>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, estado o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>

          {/* Filtro por ciudad */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all min-w-[200px] appearance-none bg-white"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all min-w-[150px]"
          >
            <option value="name">Por nombre</option>
            <option value="city">Por ciudad</option>
            <option value="recent">Más recientes</option>
          </select>

          {/* Modo de vista */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-all ${
                viewMode === 'grid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista en cuadrícula"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-all ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista en lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Limpiar filtros */}
          {(searchTerm || filterCity || sortBy !== 'name') && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      {filteredAndSortedParks.length > 0 ? (
        <>
          {/* Vista en cuadrícula */}
          {viewMode === 'grid' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedParks.map((park, index) => (
                <div
                  key={park.id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: '600ms',
                    animationFillMode: 'both'
                  }}
                >
                  <ParkCard park={park} onParkDeleted={handleParkDeleted} />
                </div>
              ))}
            </div>
          )}

          {/* Vista en lista */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredAndSortedParks.map((park, index) => (
                <div
                  key={park.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 animate-fadeIn"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '400ms',
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{park.park_name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1 text-green-600" />
                        <span>{park.park_city}, {park.park_state}</span>
                        {park.park_abbreviation && (
                          <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {park.park_abbreviation}
                          </span>
                        )}
                      </div>
                      {park.park_address && (
                        <p className="text-gray-500 text-sm">{park.park_address}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <Link
                        to={`/parks/${park.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        Ver detalles
                      </Link>
                      <Link
                        to={`/parks/${park.id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Estado vacío */
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🌳</span>
          </div>
          
          {parks.length === 0 ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay parques registrados
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Comienza agregando el primer parque al sistema para que aparezca en esta lista
              </p>
              <Link
                to="/parks/new"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Primer Parque</span>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No se encontraron parques
              </h3>
              <p className="text-gray-600 mb-8">
                No hay parques que coincidan con los filtros aplicados
              </p>
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}

      {/* Información adicional */}
      {filteredAndSortedParks.length > 0 && (
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Total: {parks.length} parque{parks.length !== 1 ? 's' : ''} • 
            Mostrando: {filteredAndSortedParks.length} • 
            Última actualización: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}