import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, identityApi } from '@core/api';
import { registrationFlowStorage, type PhoneFirstRegistrationFlow } from '@core/api/registrationFlowStorage';
import { phoneFirstRegistrationSimulator } from '@modules/identity/application/phoneFirstRegistrationSimulator';
import Routes from '@shell/navigation/routes';
import useAppState from '@shell/providers/useAppState';
import { useAppTheme } from '@shared/theme';
import { maskDestination, onlyDigits } from '@shared/validation/formRules';
import AppButton from '@shared/ui/AppButton';
import AppScreen from '@shared/ui/AppScreen';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';

type Flow = 'registration' | 'registration-v2' | 'contact';
type Message = { tone: 'success' | 'warning' | 'danger'; text: string };

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    flow: Flow;
    registrationRequestId?: string;
    channel?: 'EMAIL' | 'SMS' | 'PHONE_SIMULATOR';
    destination?: string;
    phone?: string;
    field?: 'email' | 'phone';
    simulatedSmsCode?: string;
    notice?: 'registrationRequestCreated' | 'emailVerified' | 'phoneVerificationIssued' | 'emailVerificationIssued';
  }>();
  const { verifyContactChange, requestContactChange } = useAppState();
  const { colors, spacing, typography } = useAppTheme();
  const [enteredCode, setEnteredCode] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [v2Flow, setV2Flow] = useState<PhoneFirstRegistrationFlow | null>(null);
  const channel = params.channel ?? (params.field === 'phone' ? 'SMS' : 'EMAIL');
  const isV2Registration = params.flow === 'registration-v2';
  const isV2PhoneSimulator = isV2Registration && channel === 'PHONE_SIMULATOR';
  const code = enteredCode || (!isV2Registration ? params.simulatedSmsCode ?? '' : '');
  const destination = isV2Registration
    ? (channel === 'PHONE_SIMULATOR' ? v2Flow?.phone : v2Flow?.email) ?? ''
    : params.destination ?? '';

  useEffect(() => {
    if (!isV2Registration || !params.registrationRequestId) return;
    let active = true;
    void registrationFlowStorage.get().then((stored) => {
      if (!active) return;
      if (!stored || stored.registrationRequestId !== params.registrationRequestId) {
        setMessage({ tone: 'danger', text: 'Esta solicitud ya no está disponible. Inicia el registro nuevamente.' });
        return;
      }
      setV2Flow(stored);
      if (channel !== 'PHONE_SIMULATOR') return;
      if (Platform.OS !== 'android') {
        setMessage({ tone: 'warning', text: 'El simulador solo autocompleta en Android. Si tu entorno de prueba te entrega el código, puedes ingresarlo manualmente; no se envía ningún SMS.' });
        return;
      }
      const simulatedCode = phoneFirstRegistrationSimulator.get(stored.registrationRequestId);
      if (simulatedCode) setEnteredCode(simulatedCode);
    });
    return () => { active = false; };
  }, [channel, isV2Registration, params.registrationRequestId]);

  const verify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setMessage(null);
    try {
      if (params.flow === 'contact' && params.field && params.destination) {
        await verifyContactChange(params.field, params.destination, code);
        router.replace(params.field === 'email' ? { pathname: Routes.login, params: { notice: 'emailUpdated' } } : { pathname: Routes.profile, params: { notice: 'phoneUpdated' } });
        return;
      }
      if (isV2Registration) {
        if (!params.registrationRequestId || !v2Flow) throw new Error('registration flow unavailable');
        const result = await identityApi.verifyPhoneFirstRegistrationCode(
          params.registrationRequestId,
          v2Flow.registrationProof,
          channel as 'PHONE_SIMULATOR' | 'EMAIL',
          code,
        );
        if (channel === 'PHONE_SIMULATOR' && result.status === 'PHONE_VERIFIED') {
          phoneFirstRegistrationSimulator.clear();
          router.replace({ pathname: Routes.registerStep2, params: { registrationRequestId: params.registrationRequestId } });
          return;
        }
        if (channel === 'EMAIL' && result.status === 'COMPLETED') {
          await registrationFlowStorage.clear();
          phoneFirstRegistrationSimulator.clear();
          router.replace({ pathname: Routes.login, params: { notice: 'registrationCompleted' } });
          return;
        }
        setMessage({ tone: 'warning', text: 'Aún hay una verificación pendiente. Continúa con el siguiente paso indicado.' });
        return;
      }
      if (!params.registrationRequestId) throw new Error('registration request unavailable');
      const result = await identityApi.verifyRegistrationCode(params.registrationRequestId, channel as 'EMAIL' | 'SMS', code);
      if (channel === 'EMAIL') {
        const sms = await identityApi.issueRegistrationCode(params.registrationRequestId, 'SMS');
        router.replace({ pathname: Routes.verifyCode, params: { flow: 'registration', registrationRequestId: params.registrationRequestId, channel: 'SMS', destination: params.phone, phone: params.phone, simulatedSmsCode: sms.simulatedSmsCode ?? '', notice: 'emailVerified' } });
        return;
      }
      if (result.status === 'COMPLETED') {
        router.replace({ pathname: Routes.login, params: { notice: 'registrationCompleted' } });
        return;
      }
      setMessage({ tone: 'warning', text: 'El registro aún no está completo. Verifica el canal pendiente.' });
    } catch (cause) {
      const apiError = cause as ApiError;
      setMessage({ tone: 'danger', text: apiError instanceof ApiError && apiError.code === 'NETWORK_ERROR' ? 'No logramos conectar para validar el código. Revisa tu conexión e inténtalo de nuevo.' : 'No pudimos validar ese código. Revísalo o solicita uno nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (params.flow === 'contact' && params.field && params.destination) {
        const issued = await requestContactChange(params.field, params.destination);
        setEnteredCode(issued.simulatedSmsCode ?? '');
        setMessage({ tone: 'success', text: params.field === 'phone' ? 'El simulador preparó un nuevo código para confirmar tu número.' : 'Enviamos un nuevo código a tu correo.' });
        return;
      }
      if (isV2Registration && params.registrationRequestId && v2Flow) {
        const issued = await identityApi.issuePhoneFirstRegistrationCode(params.registrationRequestId, v2Flow.registrationProof, channel as 'PHONE_SIMULATOR' | 'EMAIL');
        if (channel === 'PHONE_SIMULATOR') {
          phoneFirstRegistrationSimulator.set(params.registrationRequestId, issued.simulatedPhoneCode);
          if (Platform.OS === 'android' && issued.simulatedPhoneCode) setEnteredCode(issued.simulatedPhoneCode);
          setMessage({ tone: 'success', text: 'El simulador preparó un nuevo código para tu dispositivo Android.' });
        } else {
          setMessage({ tone: 'success', text: 'Enviamos un nuevo código a tu correo.' });
        }
        return;
      }
      if (params.flow === 'registration' && params.registrationRequestId) {
        const issued = await identityApi.issueRegistrationCode(params.registrationRequestId, channel as 'EMAIL' | 'SMS');
        setEnteredCode(issued.simulatedSmsCode ?? '');
        setMessage({ tone: 'success', text: channel === 'SMS' ? 'El simulador preparó un nuevo código para confirmar tu número.' : 'Enviamos un nuevo código a tu correo.' });
      }
    } catch {
      setMessage({ tone: 'danger', text: 'No pudimos reenviar el código. Espera un momento e inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const successMessage = params.notice === 'phoneVerificationIssued'
    ? 'Primero confirmemos tu teléfono. El simulador completa el código en Android; no se envía ningún SMS.'
    : params.notice === 'emailVerificationIssued'
      ? 'Tus credenciales están listas. Revisa el código enviado a tu correo para activar tu cuenta.'
      : params.notice === 'registrationRequestCreated'
        ? 'Tu solicitud está lista. Revisa el código que enviamos a tu correo.'
        : params.notice === 'emailVerified'
          ? 'Correo confirmado. Ahora valida tu número de teléfono para terminar el registro.'
          : null;
  const disabled = loading || code.length !== 6 || (isV2Registration && !v2Flow);

  return (
    <AppScreen>
      <ScreenHeader canGoBack title="Verifica tu código" subtitle={isV2PhoneSimulator ? 'Esta verificación temporal usa el autocompletado del simulador en Android.' : 'Ingresa el código enviado al destino indicado.'} />
      {successMessage ? <StatusBanner tone="success" title="Vamos bien" message={successMessage} /> : null}
      {destination ? <Text style={{ color: colors.primary, textAlign: 'center', marginBottom: spacing.lg }}>{maskDestination(destination)}</Text> : null}
      <TextInput accessibilityLabel="Código de verificación" value={code} onChangeText={(value) => { setEnteredCode(onlyDigits(value, 6)); setMessage(null); }} keyboardType="number-pad" maxLength={6} textAlign="center" style={[styles.code, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.textDark, fontSize: typography.xl, letterSpacing: 12 }]} />
      {message ? <StatusBanner tone={message.tone} title={message.tone === 'success' ? 'Listo' : 'Verificación'} message={message.text} /> : null}
      <View style={{ height: spacing.md }} />
      <AppButton title="Verificar" onPress={() => void verify()} disabled={disabled} loading={loading} />
      <View style={{ height: spacing.sm }} />
      <AppButton title="Reenviar código" onPress={() => void resend()} disabled={isV2Registration && !v2Flow} variant="ghost" loading={loading} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({ code: { height: 62, borderWidth: 1.5, borderRadius: 14, marginBottom: 16, paddingHorizontal: 14 } });
