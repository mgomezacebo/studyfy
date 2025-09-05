/* Guard de sesión para páginas protegidas
   Requiere que el login haya establecido:
     - sessionStorage.SesionActiva = "true"
     - localStorage.AccesoExpiraAt = <timestamp ms> // ahora + 5h
     - localStorage.AccesoValido = "true"
   Si cualquiera falla o expira → redirige a /acceso/login.html
*/
(function () {
  'use strict';

  const LOGIN_URL = '/acceso/login.html';

  function redirect(reason) {
    try {
      sessionStorage.clear();
      localStorage.removeItem('AccesoValido');
      localStorage.removeItem('AccesoExpiraAt');
    } catch (_) {}

    const url = new URL(LOGIN_URL, window.location.origin);
    url.searchParams.set('m', reason);
    window.location.replace(url.toString());
  }

  try {
    const active   = sessionStorage.getItem('SesionActiva') === 'true';
    const validFlg = localStorage.getItem('AccesoValido') === 'true';
    const expStr   = localStorage.getItem('AccesoExpiraAt');
    const now      = Date.now();
    const exp      = expStr ? parseInt(expStr, 10) : NaN;

    if (!active) return redirect('closed');
    if (!Number.isFinite(exp) || now >= exp) return redirect('expired');
    if (!validFlg) return redirect('invalid');

    const msLeft = Math.max(0, exp - now);
    setTimeout(() => redirect('expired'), msLeft);

    window.forceLogout = () => redirect('logout');

  } catch (e) {
    redirect('invalid');
  }
})();

  