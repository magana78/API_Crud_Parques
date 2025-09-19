import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building, Save, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';

// Hook personalizado para validaciones
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

// Componente de campo de entrada
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

const ParkForm = () => {
  const navigate = useNavigate();
  const { errors, validate, validateAll, setErrors } = useFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    park_name: '',
    park_abbreviation: '',
    park_img_url: '',
    park_address: '',
    park_city: '',
    park_state: 'Jalisco',
    park_zip_code: '',
    park_latitude: '',
    park_longitude: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTimeout(() => validate(name, value), 300);
  };

  const showAlert = (type, title, text, options = {}) => {
    return Swal.fire({
      icon: type,
      title,
      text,
      confirmButtonColor: '#10b981',
      ...options
    });
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

    const confirmed = await showAlert('question', '¿Crear parque?', `Nombre: ${formData.park_name}\nCiudad: ${formData.park_city}`, {
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed.isConfirmed) return;

    setIsSubmitting(true);
    
    Swal.fire({
      title: 'Creando parque...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const dataToSend = {
        ...formData,
        park_name: formData.park_name.trim(),
        park_abbreviation: formData.park_abbreviation.trim().toUpperCase(),
        park_img_url: formData.park_img_url.trim(),
        park_address: formData.park_address.trim(),
        park_state: formData.park_state.trim(),
        park_zip_code: parseInt(formData.park_zip_code),
        park_latitude: parseFloat(formData.park_latitude),
        park_longitude: parseFloat(formData.park_longitude)
      };

      await api.post('/parks', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      await showAlert('success', '¡Éxito!', `${formData.park_name} creado correctamente`, {
        timer: 2500,
        showConfirmButton: false
      });

      // Reset form
      setFormData({
        park_name: '', park_abbreviation: '', park_img_url: '',
        park_address: '', park_city: '', park_state: 'Jalisco',
        park_zip_code: '', park_latitude: '', park_longitude: ''
      });
      setErrors({});
      
      navigate('/', { state: { refresh: true } });

    } catch (error) {
      let message = 'Error desconocido';
      
      if (error.response?.status === 422) message = 'Datos inválidos';
      else if (error.response?.status === 409) message = 'Parque duplicado';
      else if (error.response?.status === 500) message = 'Error del servidor';
      else if (error.code === 'ECONNABORTED') message = 'Tiempo agotado';

      const retry = await showAlert('error', 'Error', message, {
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar'
      });

      if (retry.isConfirmed) handleSubmit(e);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const cities = ['Zapopan', 'Guadalajara', 'San Pedro Tlaquepaque', 'Tonalá'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-300 transform hover:scale-102"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Title */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Crear Nuevo Parque</h1>
                <p className="text-emerald-100">Complete la información del parque</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Información Básica */}
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

              {/* Ubicación */}
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

            {/* Submit Button */}
            <div className="flex justify-end mt-8 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-102 disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Creando...' : 'Crear Parque'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParkForm;