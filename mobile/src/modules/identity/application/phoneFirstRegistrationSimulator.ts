type SimulatedPhoneCode = { registrationRequestId: string; code: string };

let simulatedPhoneCode: SimulatedPhoneCode | null = null;

export const phoneFirstRegistrationSimulator = {
  set: (registrationRequestId: string, code: string | null | undefined) => {
    simulatedPhoneCode = code ? { registrationRequestId, code } : null;
  },
  get: (registrationRequestId: string) =>
    simulatedPhoneCode?.registrationRequestId === registrationRequestId ? simulatedPhoneCode.code : null,
  clear: () => { simulatedPhoneCode = null; },
};
