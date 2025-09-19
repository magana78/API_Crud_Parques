import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2, Shield, Info } from 'lucide-react';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  parkName,
  parkInfo = null, // Información adicional del parque
  isDeleting = false,
  dangerLevel = 'high', // 'low', 'medium', 'high'
  customMessage = null
}) => {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Manejo de teclas (ESC para cerrar, Enter para confirmar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      if (isDeleting) return; // No permitir acciones durante eliminación

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        // Ctrl+Enter para confirmar (evita eliminaciones accidentales)
        onConfirm();
      }
    };

    // Focus trap - mantener el foco dentro del modal
    const handleFocus = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        confirmButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('focusin', handleFocus);
    
    // Enfocar en el botón de confirmación cuando se abre
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isOpen, onClose, onConfirm, isDeleting]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  // Configuración basada en nivel de peligro
  const dangerConfig = {
    low: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      ringColor: 'focus:ring-yellow-500',
      icon: Info
    },
    medium: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
      ringColor: 'focus:ring-orange-500',
      icon: AlertTriangle
    },
    high: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      ringColor: 'focus:ring-red-500',
      icon: AlertTriangle
    }
  };

  const config = dangerConfig[dangerLevel];
  const IconComponent = config.icon;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl border border-gray-100"
        role="document"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all duration-200 disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center animate-pulse`}>
            <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 id="modal-title" className="text-xl font-bold text-gray-900 mb-3">
            {dangerLevel === 'high' ? '¿Eliminar parque?' : '¿Confirmar acción?'}
          </h3>
          
          <div id="modal-description" className="space-y-3">
            <p className="text-gray-600">
              {customMessage || (
                <>
                  {dangerLevel === 'high' ? 'Estás a punto de eliminar' : 'Vas a modificar'} el parque{' '}
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    "{parkName}"
                  </span>
                </>
              )}
            </p>

            {/* Información adicional del parque */}
            {parkInfo && (
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  Información del parque
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {parkInfo.city && <p>Ciudad: {parkInfo.city}</p>}
                  {parkInfo.state && <p>Estado: {parkInfo.state}</p>}
                  {parkInfo.id && <p>ID: {parkInfo.id}</p>}
                </div>
              </div>
            )}

            {/* Advertencia de peligro */}
            {dangerLevel === 'high' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-800">
                      Esta acción es irreversible
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Toda la información del parque se perderá permanentemente
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones de teclado */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400">
            Presiona <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">Esc</kbd> para cancelar
            {dangerLevel === 'high' && (
              <> o <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">Ctrl+Enter</kbd> para confirmar</>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 px-6 py-3 ${config.buttonBg} text-white rounded-xl focus:outline-none focus:ring-2 ${config.ringColor} focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center`}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                <span>{dangerLevel === 'high' ? 'Eliminar' : 'Confirmar'}</span>
              </>
            )}
          </button>
        </div>

        {/* Progress indicator */}
        {isDeleting && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-red-600 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Procesando eliminación...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;