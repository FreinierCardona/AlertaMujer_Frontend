// Mantiene solo preferencias locales y delega identidad, perfil y sesión al Backend.
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, apiClient, identityApi } from '@core/api';
import type { UserProfile } from '@core/api';
import { tokenStorage } from '@core/api/tokenStorage';
import { getCurrentCoordinates, initialDeviceRequirements, inspectDeviceRequirements, requestDeviceRequirement } from '@modules/location/infrastructure/deviceRequirements';
import type { DeviceRequirementKey, DeviceRequirements } from '@modules/location/infrastructure/deviceRequirements';
import { startBackgroundLocation, stopBackgroundLocation } from '@modules/location/infrastructure/backgroundLocation';
import { useI18n } from '@shared/i18n';

const DATA_KEY = '@alertamujer/local-prototype';
export const DEFAULT_HELP_MESSAGE = 'Necesito ayuda. He activado una alerta de emergencia. Mi ubicación se está compartiendo.';
export interface UserProfileView { username: string; name: string; lastName: string; email: string; phone: string }
export interface Contact { id: string; name: string; phone: string; relationship: string }
export interface DirectoryUser { id: string; name: string; phone: string }
export interface Coordinates { latitude: number; longitude: number; accuracy: number | null; capturedAt: string }
export interface EvidenceItem { id: string; uri: string; createdAt: string; localOnly: true }
export interface ChatMessage { id: string; author: 'user' | 'admin'; text: string; createdAt: string; localOnly: true }
export type EmergencyStatus = 'active' | 'inProgress' | 'offline' | 'finalized';
export interface Emergency { id: string; status: EmergencyStatus; previousOnlineStatus: 'active' | 'inProgress'; startedAt: string; endedAt?: string; location: Coordinates; message: string; contacts: Contact[]; evidence: EvidenceItem[]; chat: ChatMessage[] }
interface StoredState { contacts: Contact[]; activeEmergency: Emergency | null; history: Emergency[] }
const initialState: StoredState = { contacts: [], activeEmergency: null, history: [] };
const emptyProfile: UserProfileView = { username: '', name: '', lastName: '', email: '', phone: '' };
export const localDirectory: DirectoryUser[] = [{ id: 'directory-ana', name: 'Ana Torres', phone: '3001234567' }, { id: 'directory-laura', name: 'Laura Medina', phone: '3156789065' }];
const toViewProfile = (user: UserProfile): UserProfileView => ({ username: user.username, name: user.firstNames, lastName: user.lastNames, email: user.email, phone: user.phone });

interface AppStateValue extends StoredState {
  hydrated: boolean; isAuthenticated: boolean; termsPending: boolean; profile: UserProfileView; helpMessage: string; sessionNotice: string | null;
  requirements: DeviceRequirements; backgroundMessage: string | null;
  signIn: (identifier: string, password: string) => Promise<void>; signOut: () => Promise<void>; acceptTerms: () => Promise<void>;
  updateProfile: (profile: Pick<UserProfileView, 'username' | 'name' | 'lastName'>) => Promise<void>;
  requestContactChange: (field: 'email' | 'phone', value: string) => Promise<{ expiresAt: string; simulatedSmsCode?: string | null }>;
  verifyContactChange: (field: 'email' | 'phone', value: string, code: string) => Promise<void>;
  setHelpMessage: (message: string) => Promise<void>; changePassword: (currentPassword: string, newPassword: string) => Promise<void>; deleteAccount: () => Promise<void>;
  addContact: (user: DirectoryUser, relationship: string) => 'saved' | 'duplicate' | 'self'; updateContact: (id: string, relationship: string) => void; removeContact: (id: string) => void;
  refreshRequirements: () => Promise<void>; resolveRequirement: (key: DeviceRequirementKey) => Promise<void>; createEmergency: () => Promise<{ ok: boolean; reason?: string }>;
  setEmergencyStatus: (status: 'active' | 'inProgress') => void; finishEmergency: () => boolean; addEvidence: (uri: string) => boolean; sendMessage: (text: string) => boolean;
}
export const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  const [state, setState] = useState<StoredState>(initialState);
  const [profile, setProfile] = useState<UserProfileView>(emptyProfile);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [termsPending, setTermsPending] = useState(false);
  const [helpMessage, setHelpMessageState] = useState(DEFAULT_HELP_MESSAGE);
  const [hydrated, setHydrated] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [requirements, setRequirements] = useState(initialDeviceRequirements);
  const [backgroundMessage, setBackgroundMessage] = useState<string | null>(null);

  const clearSession = useCallback(async (notice: string | null = null) => {
    apiClient.setAccessToken(null); setAccessToken(null); setProfile(emptyProfile); setTermsPending(false); setHelpMessageState(DEFAULT_HELP_MESSAGE); setSessionNotice(notice);
    await tokenStorage.clear();
  }, []);
  const applySession = useCallback(async (session: { accessToken: string; refreshToken: string; user: UserProfile; termsPending: boolean }) => {
    if (session.user.role !== 'USER') throw new ApiError('Esta cuenta no puede acceder desde la aplicación móvil.', 'FORBIDDEN');
    apiClient.setAccessToken(session.accessToken); setAccessToken(session.accessToken); await tokenStorage.setRefreshToken(session.refreshToken); setTermsPending(session.termsPending); setProfile(toViewProfile(session.user));
    const [freshProfile, settings] = await Promise.all([identityApi.getProfile(), identityApi.getEmergencySettings()]);
    setProfile(toViewProfile(freshProfile)); setHelpMessageState(settings.message);
  }, []);
  const renewSession = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    try { await applySession(await identityApi.refresh(refreshToken)); return true; }
    catch { await clearSession('Tu sesión expiró. Inicia sesión nuevamente.'); return false; }
  }, [applySession, clearSession]);
  useEffect(() => { apiClient.configureSession({ refreshSession: renewSession, invalidateSession: () => { void clearSession('Tu sesión expiró. Inicia sesión nuevamente.'); } }); }, [clearSession, renewSession]);
  useEffect(() => { void (async () => { try { await renewSession(); } finally { setHydrated(true); } })(); }, [renewSession]);
  useEffect(() => { AsyncStorage.getItem(DATA_KEY).then((saved) => { if (saved) setState({ ...initialState, ...(JSON.parse(saved) as StoredState) }); }).catch(() => setState(initialState)); }, []);
  useEffect(() => { if (hydrated) void AsyncStorage.setItem(DATA_KEY, JSON.stringify(state)); }, [hydrated, state]);

  const signIn = useCallback(async (identifier: string, password: string) => { setSessionNotice(null); try { await applySession(await identityApi.login(identifier, password)); } catch (error) { await clearSession(null); throw error; } }, [applySession, clearSession]);
  const signOut = useCallback(async () => { try { if (accessToken) await identityApi.logout(); } finally { await clearSession(); } }, [accessToken, clearSession]);
  const acceptTerms = useCallback(async () => { await identityApi.acceptTerms(); setTermsPending(false); }, []);
  const updateProfile = useCallback(async (next: Pick<UserProfileView, 'username' | 'name' | 'lastName'>) => { const updated = await identityApi.updateProfile({ username: next.username, firstNames: next.name, lastNames: next.lastName }); setProfile(toViewProfile(updated)); }, []);
  const requestContactChange = useCallback((field: 'email' | 'phone', value: string) => identityApi.requestContactChange(field, value), []);
  const verifyContactChange = useCallback(async (field: 'email' | 'phone', value: string, code: string) => { await identityApi.verifyContactChange(field, value, code); if (field === 'email') { await clearSession('Tu correo cambió. Inicia sesión nuevamente.'); return; } setProfile(toViewProfile(await identityApi.getProfile())); }, [clearSession]);
  const setHelpMessage = useCallback(async (message: string) => { const saved = await identityApi.saveEmergencySettings(message); setHelpMessageState(saved.message); }, []);
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => { await identityApi.changePassword(currentPassword, newPassword); await clearSession('Tu contraseña cambió. Inicia sesión nuevamente.'); }, [clearSession]);
  const deleteAccount = useCallback(async () => { await identityApi.deleteAccount(); await clearSession('La cuenta fue eliminada.'); }, [clearSession]);
  const refreshRequirements = useCallback(async () => { setRequirements((current) => ({ ...current, checking: true })); try { setRequirements(await inspectDeviceRequirements()); } catch { setRequirements((current) => ({ ...current, checking: false })); } }, []);
  const resolveRequirement = useCallback(async (key: DeviceRequirementKey) => { try { setRequirements(await requestDeviceRequirement(key)); } catch { await refreshRequirements(); } }, [refreshRequirements]);
  useEffect(() => { const unsubscribe = NetInfo.addEventListener((network) => { const connection = Boolean(network.isConnected && network.isInternetReachable !== false); setRequirements((current) => ({ ...current, connection, checking: false })); }); return unsubscribe; }, []);
  useEffect(() => { if (!state.activeEmergency) { void stopBackgroundLocation().catch(() => undefined); return; } const title = language === 'es' ? 'Alerta Mujer activa' : 'Alerta Mujer active'; void startBackgroundLocation(title, title).then(() => setBackgroundMessage('ok')).catch(() => setBackgroundMessage('error')); }, [language, state.activeEmergency]);
  const addContact = useCallback((user: DirectoryUser, relationship: string) => { if (profile.phone && user.phone === profile.phone) return 'self'; if (state.contacts.some((item) => item.id === user.id)) return 'duplicate'; setState((current) => ({ ...current, contacts: [...current.contacts, { ...user, relationship: relationship.trim() }] })); return 'saved'; }, [profile.phone, state.contacts]);
  const updateContact = useCallback((id: string, relationship: string) => setState((current) => ({ ...current, contacts: current.contacts.map((item) => item.id === id ? { ...item, relationship } : item) })), []);
  const removeContact = useCallback((id: string) => setState((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== id) })), []);
  const createEmergency = useCallback(async () => { if (state.contacts.length === 0 || !requirements.foreground || !requirements.background || !requirements.notifications || !requirements.gps || !requirements.connection) return { ok: false, reason: 'requirements' }; try { const location = await getCurrentCoordinates(); const emergency: Emergency = { id: `L-${Date.now().toString().slice(-8)}`, status: 'active', previousOnlineStatus: 'active', startedAt: new Date().toISOString(), location, message: helpMessage || DEFAULT_HELP_MESSAGE, contacts: state.contacts.map((item) => ({ ...item })), evidence: [], chat: [] }; setState((current) => ({ ...current, activeEmergency: emergency })); return { ok: true }; } catch { return { ok: false, reason: 'location' }; } }, [helpMessage, requirements, state.contacts]);
  const setEmergencyStatus = useCallback((status: 'active' | 'inProgress') => setState((current) => current.activeEmergency ? { ...current, activeEmergency: { ...current.activeEmergency, status: requirements.connection ? status : 'offline', previousOnlineStatus: status } } : current), [requirements.connection]);
  const finishEmergency = useCallback(() => { if (!requirements.connection || !state.activeEmergency) return false; setState((current) => { if (!current.activeEmergency) return current; const finished = { ...current.activeEmergency, status: 'finalized' as const, endedAt: new Date().toISOString() }; return { ...current, activeEmergency: null, history: [finished, ...current.history] }; }); return true; }, [requirements.connection, state.activeEmergency]);
  const addEvidence = useCallback((uri: string) => { if (!requirements.connection || !state.activeEmergency) return false; const evidence: EvidenceItem = { id: `E-${Date.now()}`, uri, createdAt: new Date().toISOString(), localOnly: true }; setState((current) => current.activeEmergency ? { ...current, activeEmergency: { ...current.activeEmergency, evidence: [...current.activeEmergency.evidence, evidence] } } : current); return true; }, [requirements.connection, state.activeEmergency]);
  const sendMessage = useCallback((text: string) => { if (!requirements.connection || !state.activeEmergency || !text.trim()) return false; const message: ChatMessage = { id: `M-${Date.now()}`, author: 'user', text: text.trim(), createdAt: new Date().toISOString(), localOnly: true }; setState((current) => current.activeEmergency ? { ...current, activeEmergency: { ...current.activeEmergency, chat: [...current.activeEmergency.chat, message] } } : current); return true; }, [requirements.connection, state.activeEmergency]);
  const value = useMemo<AppStateValue>(() => ({ ...state, hydrated, isAuthenticated: Boolean(accessToken), termsPending, profile, helpMessage, sessionNotice, requirements, backgroundMessage, signIn, signOut, acceptTerms, updateProfile, requestContactChange, verifyContactChange, setHelpMessage, changePassword, deleteAccount, addContact, updateContact, removeContact, refreshRequirements, resolveRequirement, createEmergency, setEmergencyStatus, finishEmergency, addEvidence, sendMessage }), [accessToken, addContact, addEvidence, backgroundMessage, changePassword, createEmergency, deleteAccount, finishEmergency, helpMessage, hydrated, profile, refreshRequirements, removeContact, requestContactChange, requirements, resolveRequirement, sendMessage, sessionNotice, setHelpMessage, setEmergencyStatus, signIn, signOut, state, termsPending, updateContact, updateProfile, verifyContactChange, acceptTerms]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
