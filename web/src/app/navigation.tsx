// Implementa navegación SPA ligera y enlaces accesibles sin añadir una dependencia de rutas.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

interface LocationState {
  path: string;
  search: string;
}

interface NavigationValue extends LocationState {
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const NavigationContext = createContext<NavigationValue | null>(null);

function currentLocation(): LocationState {
  return { path: window.location.pathname, search: window.location.search };
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>(currentLocation);

  useEffect(() => {
    const handleChange = () => setLocation(currentLocation());
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) window.history.replaceState({}, '', to);
    else window.history.pushState({}, '', to);
    setLocation(currentLocation());
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const value = useMemo(() => ({ ...location, navigate }), [location]);
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('NavigationProvider is required');
  return value;
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function Link({ to, onClick, children, ...props }: LinkProps) {
  const { navigate } = useNavigation();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(to);
  };
  return (
    <a
      href={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
