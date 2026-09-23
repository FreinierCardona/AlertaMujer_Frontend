import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};
type DirectoryPerson = Omit<EmergencyContact, "relationship">;
type ContactsContextValue = {
  contacts: EmergencyContact[];
  ready: boolean;
  addContact: (
    person: DirectoryPerson,
    relationship: string,
  ) => "saved" | "duplicate";
  updateContact: (id: string, relationship: string) => void;
  removeContact: (id: string) => void;
};

export const localDirectory: DirectoryPerson[] = [
  { id: "directory-ana", name: "Ana Torres", phone: "+57 300 555 0101" },
  { id: "directory-lucia", name: "Lucía Pérez", phone: "+57 300 555 0102" },
  { id: "directory-maria", name: "María Rojas", phone: "+57 300 555 0103" },
];

const STORAGE_KEY = "am.emergency-contacts";
const ContactsContext = createContext<ContactsContextValue | null>(null);

export function useContacts() {
  const value = useContext(ContactsContext);
  if (!value) throw new Error("Contacts provider missing");
  return value;
}

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => setContacts(stored ? JSON.parse(stored) : []))
      .catch(() => setContacts([]))
      .finally(() => setReady(true));
  }, []);

  const persist = (next: EmergencyContact[]) => {
    setContacts(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const addContact: ContactsContextValue["addContact"] = (
    person,
    relationship,
  ) => {
    if (contacts.some((contact) => contact.id === person.id))
      return "duplicate";
    persist([...contacts, { ...person, relationship }]);
    return "saved";
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        ready,
        addContact,
        updateContact: (id, relationship) =>
          persist(
            contacts.map((contact) =>
              contact.id === id ? { ...contact, relationship } : contact,
            ),
          ),
        removeContact: (id) =>
          persist(contacts.filter((contact) => contact.id !== id)),
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}
