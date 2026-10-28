import { useEffect, useRef, useState, type FormEvent } from 'react';
import { adminUsersApi, type AdminRegistrationInput } from '../../shared/api/adminUsersApi';
import { ApiError } from '../../shared/api/client';
import { Button, Notice } from '../../shared/ui/components';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import { createUserText } from '../../shared/i18n/createUserMessages';
import '../../shared/ui/styles/CreateUserForm.css';

type Field = keyof AdminRegistrationInput;
const empty: AdminRegistrationInput = { username: '', firstNames: '', lastNames: '', email: '', phone: '', password: '' };
const groups: { title: string; fields: Field[] }[] = [
  { title: 'Datos personales', fields: ['firstNames', 'lastNames'] },
  { title: 'Datos de contacto', fields: ['email', 'phone'] },
  { title: 'Datos de acceso', fields: ['username', 'password'] },
];
const fields: Record<Field, { label: string; hint: string; autocomplete: string; max: number }> = {
  firstNames: { label: 'Nombres', hint: '', autocomplete: 'given-name', max: 100 },
  lastNames: { label: 'Apellidos', hint: '', autocomplete: 'family-name', max: 100 },
  email: { label: 'Correo electrónico', hint: 'Correo de contacto de la usuaria.', autocomplete: 'email', max: 254 },
  phone: { label: 'Teléfono celular', hint: '10 dígitos; debe comenzar por 3.', autocomplete: 'tel-national', max: 10 },
  username: { label: 'Usuario', hint: 'Ejemplo: @ana_perez. Entre 3 y 20 caracteres después de @; letras minúsculas, números o guion bajo. Debe comenzar y terminar con letra o número.', autocomplete: 'off', max: 21 },
  password: { label: 'Contraseña inicial', hint: 'Al menos 12 caracteres, una mayúscula, un número y un símbolo.', autocomplete: 'new-password', max: 255 },
};

// Reproduce las restricciones del contrato sin modificar la contraseña introducida.
function validate(field: Field, raw: string): string {
  const value = field === 'password' ? raw : raw.trim();
  if (!value.trim()) return 'Completa este campo.';
  if (value.length > fields[field].max) return 'El texto supera la longitud permitida.';
  if (field === 'email' && !/^[^\s@]+@[^\s@]+$/.test(value)) return 'Introduce un correo válido, como nombre@dominio.com.';
  if (field === 'phone' && !/^3[0-9]{9}$/.test(raw)) return 'Introduce 10 dígitos, comenzando por 3, sin espacios ni prefijo.';
  if (field === 'username' && !/^@[a-z0-9][a-z0-9_]{1,18}[a-z0-9]$/.test(value.toLowerCase())) return 'Usa @ seguido de 3 a 20 letras, números o guiones bajos; comienza y termina con letra o número.';
  if (field === 'password' && (value.length < 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value))) return 'Añade al menos 12 caracteres, una mayúscula, un número y un símbolo.';
  return '';
}

export function CreateUserForm({ onCreated }: { onCreated?: () => void }) {
  const { language } = usePreferences();
  const tr = (text: string) => createUserText(text, language);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLSpanElement>(null);
  const inFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [discard, setDiscard] = useState(false);

  // El diálogo nativo mantiene el foco dentro del panel y vuelve inerte el fondo.
  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    const opener = trigger.current?.querySelector('button');
    element.showModal();
    document.body.classList.add('modal-open');
    element.querySelector<HTMLInputElement>('input')?.focus();
    return () => {
      element.close();
      document.body.classList.remove('modal-open');
      opener?.focus();
    };
  }, [open]);

  // Recupera un destino de foco útil cuando cambia el contenido del panel.
  useEffect(() => {
    if (!open) return;
    if (requestId || discard) dialog.current?.querySelector<HTMLElement>('.create-user__content')?.focus();
    else dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, [open, requestId, discard]);

  const close = () => {
    if (inFlight.current) return;
    if (!requestId && Object.values(values).some(Boolean)) { setDiscard(true); return; }
    setOpen(false);
  };
  const reset = () => {
    setValues(empty); setErrors({}); setError(null); setRequestId(null);
    setShowPassword(false); setDiscard(false);
  };
  const focusField = (field: Field) => dialog.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    const checked = Object.fromEntries(groups.flatMap(group => group.fields).map(field => [field, validate(field, values[field])])) as Record<Field, string>;
    setErrors(checked); setError(null);
    const firstInvalid = groups.flatMap(group => group.fields).find(field => checked[field]);
    if (firstInvalid) { focusField(firstInvalid); return; }
    inFlight.current = true; setBusy(true);
    try {
      const response = await adminUsersApi.create({ ...values, username: values.username.trim().toLowerCase(), email: values.email.trim().toLowerCase() });
      if (response.status !== 'COMPLETED') throw new Error('Administrative account was not completed');
      onCreated?.();
      setRequestId(response.registrationRequestId); setValues(empty); setShowPassword(false);
    } catch (cause) {
      setError(cause instanceof ApiError && cause.code === 'REGISTRATION_DUPLICATE' ? 'Hay datos ya registrados. Revisa usuario, correo y teléfono.' : 'No fue posible crear la cuenta. Inténtalo de nuevo.');
      if (cause instanceof ApiError) {
        const serverErrors: Partial<Record<Field, string>> = {};
        for (const item of cause.fields) {
          if (item.field && Object.hasOwn(fields, item.field)) serverErrors[item.field as Field] = cause.code === 'REGISTRATION_DUPLICATE' ? 'Este dato ya está registrado. Usa uno diferente.' : 'Revisa este dato e inténtalo de nuevo.';
        }
        setErrors(serverErrors);
        const first = groups.flatMap(group => group.fields).find(field => serverErrors[field]);
        // Espera a que los campos vuelvan a estar habilitados antes de enfocar el error.
        if (first) window.requestAnimationFrame(() => focusField(first));
      }
    } finally { inFlight.current = false; setBusy(false); }
  };

  return <>
    <span ref={trigger}><Button onClick={() => { reset(); setOpen(true); }}>{tr("Crear usuaria")}</Button></span>
    {open && <dialog ref={dialog} className="create-user" aria-labelledby="create-user-title" aria-describedby="create-user-intro"
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={event => { event.preventDefault(); close(); }}>
      <header className="create-user__header">
        <div><span className="create-user__eyebrow">{tr("GESTIÓN DE USUARIAS")}</span><h2 id="create-user-title">{tr("Crear usuaria")}</h2></div>
        <button className="create-user__close" type="button" aria-label={tr('Cerrar formulario')} disabled={busy} onClick={close}>×</button>
        <p id="create-user-intro">{tr("Registra sus datos para crear una cuenta activa.")}</p>
      </header>
      {discard ? <section className="create-user__content" tabIndex={-1} aria-labelledby="discard-title">
        <h3 id="discard-title">{tr("¿Descartar los datos?")}</h3><p>{tr("Los datos introducidos se perderán. Todavía no se ha creado la cuenta.")}</p>
        <div className="create-user__actions"><Button onClick={() => setDiscard(false)}>{tr("Seguir completando")}</Button><Button variant="secondary" onClick={() => { reset(); setOpen(false); }}>{tr("Descartar y cerrar")}</Button></div>
      </section> : requestId ? <section className="create-user__content" tabIndex={-1} aria-label={tr('Usuaria creada · Cuenta activa')}>
        <Notice kind="success"><strong>{tr("Usuaria creada · Cuenta activa")}</strong><p>{tr("La usuaria ya puede iniciar sesión con su usuario o correo y la contraseña inicial, sin códigos de verificación. Al ingresar deberá aceptar las condiciones de uso.")}</p></Notice>
        {error && <Notice kind="error">{tr(error)}</Notice>}
        <div className="create-user__success-actions">
          <Button variant="secondary" disabled={busy} onClick={reset}>{tr("Crear otra usuaria")}</Button>
          <Button variant="secondary" disabled={busy} onClick={close}>{tr("Cerrar")}</Button>
        </div>
      </section> : <form noValidate onSubmit={event => void submit(event)} className="create-user__form" aria-busy={busy}>
        <div className="create-user__content">
          <p className="create-user__required">{tr('Todos los campos son obligatorios')} <span aria-hidden="true">*</span></p>
          {error && <Notice kind="error">{tr(error)}</Notice>}
          {groups.map(group => <fieldset key={group.title} className="create-user__section" disabled={busy}>
            <legend>{tr(group.title)}</legend><div className="create-user__grid">
              {group.fields.map(field => <div key={field} className={`create-user__field ${field === 'username' || field === 'password' ? 'create-user__field--wide' : ''}`}>
                <label htmlFor={`create-${field}`}>{tr(fields[field].label)} <span aria-hidden="true">*</span></label>
                <div className="create-user__input-row"><input id={`create-${field}`} name={field} required value={values[field]}
                  autoComplete={fields[field].autocomplete} maxLength={fields[field].max} spellCheck={field === 'username' ? false : undefined}
                  type={field === 'password' ? showPassword ? 'text' : 'password' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  inputMode={field === 'phone' ? 'numeric' : undefined} aria-invalid={Boolean(errors[field])}
                  aria-describedby={`create-${field}-help create-${field}-status`}
                  onChange={event => { setValues(current => ({ ...current, [field]: event.target.value })); setErrors(current => ({ ...current, [field]: undefined })); }}
                  onBlur={() => setErrors(current => ({ ...current, [field]: validate(field, values[field]) }))} />
                  {field === 'password' && <button type="button" className="create-user__visibility" aria-label={tr(showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña')} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{tr(showPassword ? 'Ocultar' : 'Mostrar')}</button>}
                </div>
                <small id={`create-${field}-help`}>{tr(fields[field].hint)}</small>
                <small id={`create-${field}-status`} className={errors[field] ? 'create-user__error' : 'create-user__valid'} aria-live="polite">{tr(errors[field] || (errors[field] === '' ? '✓ Formato válido' : ''))}</small>
              </div>)}
            </div>
          </fieldset>)}
        </div>
        <footer className="create-user__footer"><p>{tr("La cuenta quedará activa, sin verificación adicional.")}</p><div className="create-user__actions">
          <Button type="button" variant="secondary" disabled={busy} onClick={close}>{tr("Cancelar")}</Button>
          <Button type="submit" disabled={busy}>{tr(busy ? 'Creando cuenta…' : 'Crear cuenta')}</Button>
        </div><span className="create-user__announcement" role="status">{tr(busy ? 'Creando cuenta. Espera un momento.' : '')}</span></footer>
      </form>}
    </dialog>}
  </>;
}
