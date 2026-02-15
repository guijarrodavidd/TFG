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
  
  // Debug para consola
  console.log("🛡️ Guard - Usuario:", user.nombre, "| Rol ID:", user.rol_id, "| Rol Alias:", user.rol);

  // Convertimos a número para evitar problemas de tipos (string vs number)
  const rolID = Number(user.rol_id);

  // Verificación: Rol 1 (SuperAdmin) o Rol 2 (Encargado/Admin empresa)
  const esAutorizado = 
    rolID === 1 || 
    rolID === 2 || 
    user.rol === 'admin' || 
    user.rol === 'superadmin';

  if (esAutorizado) {
    return true;
  }

  // Si no es ninguno de los anteriores, rebotamos al home con el error para el Toast
  console.error("🚫 Acceso denegado para el rol:", rolID);
  router.navigate(['/dashboard/home'], { queryParams: { error: 'unauthorized' } });
  return false;
};