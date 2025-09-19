import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Building, Save, ArrowLeft, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';

// Hook reutilizable de validaciones (igual que ParkForm)
const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  
  const validationRules = {
    park_name: (value) => {
      if (!value.trim()) return 'El nombre es requerido';
      if (value.length < 3) return 'Mínimo 3 caracteres';
      if (value.length > 100) return 'Máximo 100 caracteres';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return 'Solo letras y espacios';
      return null;
    },
    park_abbreviation: (value) => {
      if (!value.trim()) return 'La abreviación es requerida';
      if (value.length < 2) return 'Mínimo 2 caracteres';
      if (value.length > 10) return 'Máximo 10 caracteres';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(value.trim())) return 'Solo letras';
      return null;
    },
    park_img_url: (value) => {
      if (!value.trim()) return 'La URL es requerida';
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(value)) return 'URL inválida (.jpg, .jpeg, .png, .webp)';
      return null;
    },
    park_address: (value) => {
      if (!value.trim()) return 'La dirección es requerida';
      if (value.length < 10) return 'Mínimo 10 caracteres';
      if (value.length > 150) return 'Máximo 150 caracteres';
      return null;
    },
    park_city: (value) => {
      const validCities = ['Zapopan', 'Guadalajara', 'San Pedro Tlaquepaque', 'Tonalá'];
      if (!value) return 'La ciudad es requerida';
      if (!validCities.includes(value)) return 'Ciudad no válida';
      return null;
    },
    park_zip_code: (value) => {
      if (!value) return 'El código postal es requerido';
      if (!/^4[4-5]\d{3}$/.test(value)) return 'Código inválido para Jalisco (44xxx o 45xxx)';
      return null;
    },
    park_latitude: (value) => {
      if (!value) return 'La latitud es requerida';
      if (isNaN(value) || value < 20 || value > 21.5) return 'Latitud inválida para Jalisco (20-21.5)';
      return null;
    },
    park_longitude: (value) => {
      if (!value) return 'La longitud es requerida';
      if (isNaN(value) || value < -105 || value > -102) return 'Longitud inválida para Jalisco (-105 a -102)';
      return null;
    }
  };

  const validate = (name, value) => {
    const error = validationRules[name]?.(value);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
    return !error;
  };

  const validateAll = (formData) => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      const error = validationRules[key]?.(formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  return { errors, validate, validateAll, setErrors };
};

// Componente InputField reutilizable
const InputField = ({ label, name, value, onChange, error, type = "text", placeholder, maxLength, required = true, options = null }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      >
        <option value="">Seleccionar {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        step={type === 'number' ? 'any' : undefined}
        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
        placeholder={placeholder}
      />
    )}
    
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <span className="mr-1">⚠️</span> {error}
      </p>
    )}
    
    {maxLength && (
      <p className="text-gray-500 text-xs mt-1">{value.length}/{maxLength} caracteres</p>
    )}
  </div>
);

const ParkEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { errors, validate, validateAll } = useFormValidation();
  
  const [formData, setFormData] = useState({
    park_name: '', park_abbreviation: '', park_img_url: '',
    park_address: '', park_city: '', park_state: 'Jalisco',
    park_zip_code: '', park_latitude: '', park_longitude: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState({});

  const cities = ['Zapopan', 'Guadalajara', 'San Pedro Tlaquepaque', 'Tonalá'];

  const showAlert = (type, title, text, options = {}) => {
    return Swal.fire({
      icon: type,
      title,
      text,
      confirmButtonColor: '#10b981',
      ...options
    });
  };

  // Cargar datos del parque con Sweet Alert
  useEffect(() => {
    const fetchPark = async () => {
      if (!navigator.onLine) {
        showAlert('warning', 'Sin conexión', 'Verifica tu conexión a internet');
        navigate('/');
        return;
      }

      try {
        console.log('Cargando parque ID:', id);
        
        const response = await api.get(`/parks/${id}`, {
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        });
        
        const park = response.data.data || response.data;
        
        if (!park || !park.park_name) {
          throw new Error('Datos del parque incompletos');
        }
        
        const parkData = {
          park_name: park.park_name || '',
          park_abbreviation: park.park_abbreviation || '',
          park_img_url: park.park_img_url || '',
          park_address: park.park_address || '',
          park_city: park.park_city || '',
          park_state: park.park_state || 'Jalisco',
          park_zip_code: park.park_zip_code?.toString() || '',
          park_latitude: park.park_latitude?.toString() || '',
          park_longitude: park.park_longitude?.toString() || ''
        };
        
        setFormData(parkData);
        setOriginalData(parkData);
        
        // Notificación de éxito
        Swal.fire({
          icon: 'success',
          title: 'Parque cargado',
          text: `${park.park_name} listo para editar`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        
      } catch (error) {
        console.error('Error al cargar parque:', error);
        
        let errorMessage = 'No se pudo cargar el parque';
        let errorTitle = 'Error de carga';
        
        if (error.response?.status === 404) {
          errorTitle = 'Parque no encontrado';
          errorMessage = `No existe un parque con ID: ${id}`;
        } else if (error.response?.status === 500) {
          errorTitle = 'Error del servidor';
          errorMessage = 'Problema en el servidor. Intenta más tarde.';
        } else if (error.code === 'ECONNABORTED') {
          errorTitle = 'Tiempo agotado';
          errorMessage = 'La carga tardó demasiado tiempo.';
        }

        const result = await showAlert('error', errorTitle, errorMessage, {
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Volver al inicio'
        });

        if (result.isConfirmed) {
          window.location.reload();
        } else {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPark();
    } else {
      showAlert('warning', 'ID faltante', 'No se proporcionó un ID de parque válido');
      navigate('/');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTimeout(() => validate(name, value), 300);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      return showAlert('warning', 'Sin conexión', 'Verifica tu conexión a internet');
    }

    if (!validateAll(formData)) {
      const errorCount = Object.keys(errors).length;
      return showAlert('error', 'Formulario incompleto', `Corrige ${errorCount} campo(s) con errores`);
    }

    if (!hasChanges()) {
      return showAlert('info', 'Sin cambios', 'No se detectaron modificaciones en el parque');
    }

    // Mostrar resumen de cambios
    const changes = [];
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes.push(`• ${key.replace('park_', '').replace('_', ' ')}: "${originalData[key]}" → "${formData[key]}"`);
      }
    });

    const confirmed = await Swal.fire({
      icon: 'question',
      title: '¿Actualizar parque?',
      html: `
        <div class="text-left">
          <p class="mb-3"><strong>Parque:</strong> ${formData.park_name}</p>
          <p class="mb-2"><strong>Cambios detectados:</strong></p>
          <div class="text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            ${changes.slice(0, 5).join('<br>')}
            ${changes.length > 5 ? `<br>...y ${changes.length - 5} más` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444'
    });

    if (!confirmed.isConfirmed) return;

    setIsSubmitting(true);

    Swal.fire({
      title: 'Actualizando parque...',
      text: 'Por favor espera mientras guardamos los cambios',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const dataToUpdate = {
        park_name: formData.park_name.trim(),
        park_abbreviation: formData.park_abbreviation.trim().toUpperCase(),
        park_img_url: formData.park_img_url.trim(),
        park_address: formData.park_address.trim(),
        park_city: formData.park_city,
        park_state: formData.park_state.trim(),
        park_zip_code: parseInt(formData.park_zip_code),
        park_latitude: parseFloat(formData.park_latitude),
        park_longitude: parseFloat(formData.park_longitude)
      };

      console.log('Actualizando parque:', { id, data: dataToUpdate });

      const response = await api.put(`/parks/${id}`, dataToUpdate, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('Respuesta:', response);

      if (response.status === 200 || response.status === 201) {
        await showAlert('success', '¡Parque actualizado!', `${formData.park_name} se actualizó correctamente`, {
          timer: 3000,
          showConfirmButton: false
        });

        navigate('/', { state: { refresh: true } });
      }

    } catch (error) {
      console.error('Error al actualizar:', error);
      
      let message = 'Error desconocido al actualizar';
      let title = 'Error de actualización';
      
      if (error.response?.status === 422) {
        title = 'Datos inválidos';
        message = 'Los datos enviados no son válidos. Revisa todos los campos.';
      } else if (error.response?.status === 404) {
        title = 'Parque no encontrado';
        message = 'El parque ya no existe o fue eliminado.';
      } else if (error.response?.status === 409) {
        title = 'Conflicto de datos';
        message = 'Ya existe otro parque con ese nombre o abreviación.';
      } else if (error.response?.status === 500) {
        title = 'Error del servidor';
        message = 'Problema en el servidor. Intenta más tarde.';
      } else if (error.code === 'ECONNABORTED') {
        title = 'Tiempo agotado';
        message = 'La actualización tardó demasiado tiempo.';
      }

      const retry = await showAlert('error', title, message, {
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar'
      });

      if (retry.isConfirmed) {
        handleSubmit(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading elegante
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-emerald-200" style={{animationDuration: '2s'}}></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-emerald-500 absolute top-0" style={{animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-center">
            <p className="text-emerald-700 font-medium text-lg">Cargando parque...</p>
            <p className="text-emerald-500 text-sm opacity-75">ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (hasChanges()) {
                Swal.fire({
                  icon: 'warning',
                  title: '¿Descartar cambios?',
                  text: 'Tienes cambios sin guardar que se perderán',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, descartar',
                  cancelButtonText: 'Continuar editando',
                  confirmButtonColor: '#ef4444'
                }).then((result) => {
                  if (result.isConfirmed) navigate('/');
                });
              } else {
                navigate('/');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-300 transform hover:scale-102"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          
          {hasChanges() && (
            <span className="text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full">
              Cambios sin guardar
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
            <div className="flex items-center space-x-4">
              <Edit className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Editar Parque</h1>
                <p className="text-emerald-100">
                  Actualizando: {formData.park_name || 'Cargando...'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <Building className="w-5 h-5 mr-2 text-emerald-600" />
                  Información Básica
                </h3>

                <InputField
                  label="Nombre del Parque"
                  name="park_name"
                  value={formData.park_name}
                  onChange={handleChange}
                  error={errors.park_name}
                  placeholder="Ej: Parque Metropolitano"
                  maxLength={100}
                />

                <InputField
                  label="Abreviación"
                  name="park_abbreviation"
                  value={formData.park_abbreviation}
                  onChange={handleChange}
                  error={errors.park_abbreviation}
                  placeholder="Ej: PM"
                  maxLength={10}
                />

                <InputField
                  label="URL de Imagen"
                  name="park_img_url"
                  value={formData.park_img_url}
                  onChange={handleChange}
                  error={errors.park_img_url}
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Ubicación
                </h3>

                <InputField
                  label="Dirección"
                  name="park_address"
                  value={formData.park_address}
                  onChange={handleChange}
                  error={errors.park_address}
                  placeholder="Av. Alcalde 1351, Col. Miraflores"
                  maxLength={150}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Ciudad"
                    name="park_city"
                    value={formData.park_city}
                    onChange={handleChange}
                    error={errors.park_city}
                    options={cities}
                  />

                  <InputField
                    label="Código Postal"
                    name="park_zip_code"
                    value={formData.park_zip_code}
                    onChange={handleChange}
                    error={errors.park_zip_code}
                    type="number"
                    placeholder="44100"
                  />
                </div>

                <InputField
                  label="Estado"
                  name="park_state"
                  value={formData.park_state}
                  onChange={handleChange}
                  error={errors.park_state}
                  placeholder="Jalisco"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Latitud"
                    name="park_latitude"
                    value={formData.park_latitude}
                    onChange={handleChange}
                    error={errors.park_latitude}
                    type="number"
                    placeholder="20.6597"
                  />

                  <InputField
                    label="Longitud"
                    name="park_longitude"
                    value={formData.park_longitude}
                    onChange={handleChange}
                    error={errors.park_longitude}
                    type="number"
                    placeholder="-103.3496"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParkEditForm;