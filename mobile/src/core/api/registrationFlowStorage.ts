import * as SecureStore from 'expo-secure-store';

const PHONE_FIRST_REGISTRATION_KEY = 'alertamujer.phone-first-registration';

export type PhoneFirstRegistrationFlow = {
  registrationRequestId: string;
  registrationProof: string;
  phone: string;
  email?: string;
};

export const registrationFlowStorage = {
  async get(): Promise<PhoneFirstRegistrationFlow | null> {
    const stored = await SecureStore.getItemAsync(PHONE_FIRST_REGISTRATION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as PhoneFirstRegistrationFlow;
    } catch {
      await SecureStore.deleteItemAsync(PHONE_FIRST_REGISTRATION_KEY);
      return null;
    }
  },
  save: (flow: PhoneFirstRegistrationFlow) =>
    SecureStore.setItemAsync(PHONE_FIRST_REGISTRATION_KEY, JSON.stringify(flow)),
  async setEmail(email: string) {
    const flow = await this.get();
    if (!flow) return;
    await this.save({ ...flow, email });
  },
  clear: () => SecureStore.deleteItemAsync(PHONE_FIRST_REGISTRATION_KEY),
};
