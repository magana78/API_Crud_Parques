// hooks/useDeletePark.js
import { useState } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

export const useDeletePark = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const deletePark = async (parkId, parkName) => {
    // Mostrar confirmación con SweetAlert
    const result = await Swal.fire({
      title: '¿Eliminar parque?',
      html: `¿Estás seguro de que deseas eliminar el parque <strong>"${parkName}"</strong>?<br><small style="color: #dc2626;">Esta acción no se puede deshacer.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      return { success: false, cancelled: true };
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      console.log('=== ELIMINANDO PARQUE ===');
      console.log('ID:', parkId);
      console.log('URL completa:', `${api.defaults.baseURL}/parks/${parkId}`);

      const response = await api.delete(`/parks/${parkId}`);

      console.log('=== RESPUESTA DE ELIMINACIÓN ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      if (response.status === 200 || response.status === 204) {
        // Mostrar éxito con SweetAlert
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El parque "${parkName}" ha sido eliminado exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Recargar la página después de mostrar el éxito
        setTimeout(() => {
          window.location.reload();
        }, 2100);

        return { success: true, data: response.data };
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('=== ERROR AL ELIMINAR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error desconocido al eliminar el parque';

      // Mostrar error con SweetAlert
      await Swal.fire({
        title: 'Error',
        text: `No se pudo eliminar el parque: ${errorMessage}`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });

      setDeleteError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deletePark,
    isDeleting,
    deleteError,
    clearError: () => setDeleteError(null)
  };
};