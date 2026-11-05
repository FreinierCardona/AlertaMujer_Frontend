// Dibuja un conjunto pequeño de iconos SVG reutilizados en navegación, estados y acciones.
import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'spark'
  | 'shield'
  | 'download'
  | 'moon'
  | 'sun'
  | 'globe'
  | 'menu'
  | 'close'
  | 'dashboard'
  | 'alert'
  | 'users'
  | 'audit'
  | 'logout'
  | 'search'
  | 'calendar'
  | 'chevronLeft'
  | 'chevronRight'
  | 'eye'
  | 'mapPin'
  | 'camera'
  | 'chat'
  | 'check'
  | 'warning'
  | 'error'
  | 'info'
  | 'lock'
  | 'mail'
  | 'phone'
  | 'plus'
  | 'send'
  | 'user'
  | 'arrowLeft'
  | 'refresh';

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10M9 20v-6h6v6" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
  shield: (
    <path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" />
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 19h14" />
    </>
  ),
  moon: <path d="M20 15.4A8 8 0 0 1 8.6 4a8 8 0 1 0 11.4 11.4Z" />,
  sun: (
    <>
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  globe: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.5 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.5-4-9s1.4-6.5 4-9Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  dashboard: (
    <>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </>
  ),
  alert: (
    <>
      <path d="M12 3a7 7 0 0 0-7 7v4l-2 3h18l-2-3v-4a7 7 0 0 0-7-7Z" />
      <path d="M9.5 20h5" />
    </>
  ),
  users: (
    <>
      <circle
        cx="9"
        cy="8"
        r="3"
      />
      <path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" />
      <circle
        cx="17"
        cy="9"
        r="2"
      />
      <path d="M16 14h1a4 4 0 0 1 4 4v2" />
    </>
  ),
  audit: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4m-5-4h9" />
    </>
  ),
  search: (
    <>
      <circle
        cx="11"
        cy="11"
        r="7"
      />
      <path d="m16 16 5 5" />
    </>
  ),
  calendar: (
    <>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 3v4m8-4v4M3 10h18" />
    </>
  ),
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </>
  ),
  camera: (
    <>
      <path d="M4 7h4l1.5-2h5L16 7h4v12H4z" />
      <circle
        cx="12"
        cy="13"
        r="3"
      />
    </>
  ),
  chat: <path d="M4 4h16v12H8l-4 4V4Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  warning: (
    <>
      <path d="m12 3 10 18H2L12 3Z" />
      <path d="M12 9v5m0 3h.01" />
    </>
  ),
  error: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  info: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 11v6m0-10h.01" />
    </>
  ),
  lock: (
    <>
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  mail: (
    <>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: <path d="M7 3 4 5c0 8 7 15 15 15l2-3-5-3-2 2c-3-1-5-3-6-6l2-2-3-5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="m3 4 18 8-18 8 3-8-3-8Zm3 8h15" />,
  user: (
    <>
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  arrowLeft: <path d="m15 18-6-6 6-6M9 12h11" />,
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M18.5 16A8 8 0 1 1 20 12" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
