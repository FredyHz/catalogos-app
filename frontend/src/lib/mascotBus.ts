// Bus de eventos ligero para la mascota de notificaciones.
// Cualquier componente puede llamar a notifyMascot(...) sin necesidad
// de props, contexto, ni hooks — se conecta vía un CustomEvent del navegador.

export type MascotType = 'success' | 'error' | 'info';

export interface MascotDetail {
  message: string;
  type: MascotType;
}

export const MASCOT_EVENT_NAME = 'stylefreds-mascot-notify';

export function notifyMascot(message: string, type: MascotType = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<MascotDetail>(MASCOT_EVENT_NAME, { detail: { message, type } })
  );
}