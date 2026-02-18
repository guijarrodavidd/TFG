import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStr = localStorage.getItem('usuario');

  if (!userStr) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userStr);
  
  console.log("Guard - Usuario:", user.nombre, "| Rol ID:", user.rol_id, "| Rol Alias:", user.rol);

  // PASAR A NUMERO POR SI DA ERROR
  const rolID = Number(user.rol_id);

  // VERIFICAR SI ES ADMIN O ENCARGADO
  const esAutorizado = 
    rolID === 1 || 
    rolID === 2 || 
    user.rol === 'admin' || 
    user.rol === 'superadmin';

  if (esAutorizado) {
    return true;
  }

  // MANEJO DE ERRORES POR USUARIO, SI NO SE PUEDE DEVOLVER A HOME
  console.error("🚫 Acceso denegado para el rol:", rolID);
  router.navigate(['/dashboard/home'], { queryParams: { error: 'unauthorized' } });
  return false;
};