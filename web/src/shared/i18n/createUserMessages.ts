import type { Language } from '../types/models';

// Traduce también los errores almacenados al renderizar, según la preferencia actual.
const messages: Record<string, Record<Language, string>> = {
  "Crear usuaria": {
    "es": "Crear usuaria",
    "en": "Create user",
    "pt": "Criar usuária",
    "fr": "Créer une utilisatrice"
  },
  "GESTIÓN DE USUARIAS": {
    "es": "GESTIÓN DE USUARIAS",
    "en": "USER MANAGEMENT",
    "pt": "GESTÃO DE USUÁRIAS",
    "fr": "GESTION DES UTILISATRICES"
  },
  "Datos personales": {
    "es": "Datos personales",
    "en": "Personal details",
    "pt": "Dados pessoais",
    "fr": "Informations personnelles"
  },
  "Datos de contacto": {
    "es": "Datos de contacto",
    "en": "Contact details",
    "pt": "Dados de contato",
    "fr": "Coordonnées"
  },
  "Datos de acceso": {
    "es": "Datos de acceso",
    "en": "Sign-in details",
    "pt": "Dados de acesso",
    "fr": "Identifiants de connexion"
  },
  "Nombres": {
    "es": "Nombres",
    "en": "First names",
    "pt": "Nomes",
    "fr": "Prénoms"
  },
  "Apellidos": {
    "es": "Apellidos",
    "en": "Last names",
    "pt": "Sobrenomes",
    "fr": "Nom de famille"
  },
  "Correo electrónico": {
    "es": "Correo electrónico",
    "en": "Email address",
    "pt": "E-mail",
    "fr": "Adresse e-mail"
  },
  "Teléfono celular": {
    "es": "Teléfono celular",
    "en": "Mobile phone",
    "pt": "Celular",
    "fr": "Téléphone portable"
  },
  "Usuario": {
    "es": "Usuario",
    "en": "Username",
    "pt": "Nome de usuário",
    "fr": "Nom d’utilisateur"
  },
  "Contraseña inicial": {
    "es": "Contraseña inicial",
    "en": "Initial password",
    "pt": "Senha inicial",
    "fr": "Mot de passe initial"
  },
  "Correo de contacto de la usuaria.": {
    "es": "Correo de contacto de la usuaria.",
    "en": "User contact email.",
    "pt": "E-mail de contato da usuária.",
    "fr": "Adresse de contact de l’utilisatrice."
  },
  "10 dígitos; debe comenzar por 3.": {
    "es": "10 dígitos; debe comenzar por 3.",
    "en": "10 digits, starting with 3.",
    "pt": "10 dígitos, começando por 3.",
    "fr": "10 chiffres, commençant par 3."
  },
  "Ejemplo: @ana_perez. Entre 3 y 20 caracteres después de @; letras minúsculas, números o guion bajo. Debe comenzar y terminar con letra o número.": {
    "es": "Ejemplo: @ana_perez. Entre 3 y 20 caracteres después de @; letras minúsculas, números o guion bajo. Debe comenzar y terminar con letra o número.",
    "en": "Example: @ana_perez. Use 3–20 lowercase letters, digits or underscores after @. Start and end with a letter or digit.",
    "pt": "Exemplo: @ana_perez. Use de 3 a 20 letras minúsculas, números ou sublinhados após @. Comece e termine com letra ou número.",
    "fr": "Exemple : @ana_perez. Utilisez 3 à 20 lettres minuscules, chiffres ou tirets bas après @. Commencez et terminez par une lettre ou un chiffre."
  },
  "Al menos 12 caracteres, una mayúscula, un número y un símbolo.": {
    "es": "Al menos 12 caracteres, una mayúscula, un número y un símbolo.",
    "en": "At least 12 characters, one uppercase letter, one digit and one symbol.",
    "pt": "Pelo menos 12 caracteres, uma letra maiúscula, um número e um símbolo.",
    "fr": "Au moins 12 caractères, une majuscule, un chiffre et un symbole."
  },
  "Completa este campo.": {
    "es": "Completa este campo.",
    "en": "Complete this field.",
    "pt": "Preencha este campo.",
    "fr": "Remplissez ce champ."
  },
  "El texto supera la longitud permitida.": {
    "es": "El texto supera la longitud permitida.",
    "en": "The text exceeds the allowed length.",
    "pt": "O texto excede o tamanho permitido.",
    "fr": "Le texte dépasse la longueur autorisée."
  },
  "Introduce un correo válido, como nombre@dominio.com.": {
    "es": "Introduce un correo válido, como nombre@dominio.com.",
    "en": "Enter a valid email, such as name@example.com.",
    "pt": "Digite um e-mail válido, como nome@dominio.com.",
    "fr": "Saisissez une adresse valide, comme nom@domaine.fr."
  },
  "Introduce 10 dígitos, comenzando por 3, sin espacios ni prefijo.": {
    "es": "Introduce 10 dígitos, comenzando por 3, sin espacios ni prefijo.",
    "en": "Enter 10 digits starting with 3, without spaces or a prefix.",
    "pt": "Digite 10 dígitos começando por 3, sem espaços nem prefixo.",
    "fr": "Saisissez 10 chiffres commençant par 3, sans espaces ni préfixe."
  },
  "Usa @ seguido de 3 a 20 letras, números o guiones bajos; comienza y termina con letra o número.": {
    "es": "Usa @ seguido de 3 a 20 letras, números o guiones bajos; comienza y termina con letra o número.",
    "en": "Use @ followed by 3–20 letters, digits or underscores; start and end with a letter or digit.",
    "pt": "Use @ seguido de 3 a 20 letras, números ou sublinhados; comece e termine com letra ou número.",
    "fr": "Utilisez @ suivi de 3 à 20 lettres, chiffres ou tirets bas ; commencez et terminez par une lettre ou un chiffre."
  },
  "Añade al menos 12 caracteres, una mayúscula, un número y un símbolo.": {
    "es": "Añade al menos 12 caracteres, una mayúscula, un número y un símbolo.",
    "en": "Use at least 12 characters, one uppercase letter, one digit and one symbol.",
    "pt": "Use pelo menos 12 caracteres, uma maiúscula, um número e um símbolo.",
    "fr": "Utilisez au moins 12 caractères, une majuscule, un chiffre et un symbole."
  },
  "No fue posible crear la cuenta. Inténtalo de nuevo.": {
    "es": "No fue posible crear la cuenta. Inténtalo de nuevo.",
    "en": "Could not create the account. Try again.",
    "pt": "Não foi possível criar a conta. Tente novamente.",
    "fr": "Impossible de créer le compte. Réessayez."
  },
  "Revisa este dato e inténtalo de nuevo.": {
    "es": "Revisa este dato e inténtalo de nuevo.",
    "en": "Check this value and try again.",
    "pt": "Confira este dado e tente novamente.",
    "fr": "Vérifiez cette donnée et réessayez."
  },
  "Este dato ya está registrado. Usa uno diferente.": {
    "es": "Este dato ya está registrado. Usa uno diferente.",
    "en": "This value is already registered. Use a different one.",
    "pt": "Este dado já está cadastrado. Use outro.",
    "fr": "Cette donnée est déjà enregistrée. Utilisez-en une autre."
  },
  "Hay datos ya registrados. Revisa usuario, correo y teléfono.": {
    "es": "Hay datos ya registrados. Revisa usuario, correo y teléfono.",
    "en": "Some details are already registered. Check the username, email and phone.",
    "pt": "Há dados já cadastrados. Confira o usuário, e-mail e telefone.",
    "fr": "Certaines données sont déjà enregistrées. Vérifiez le nom d’utilisateur, l’e-mail et le téléphone."
  },
  "La solicitud sigue pendiente. No fue posible enviar el código; reintenta.": {
    "es": "La solicitud sigue pendiente. No fue posible enviar el código; reintenta.",
    "en": "The request is still pending. The code could not be sent; try again.",
    "pt": "A solicitação continua pendente. Não foi possível enviar o código; tente novamente.",
    "fr": "La demande reste en attente. Impossible d’envoyer le code ; réessayez."
  },
  "Cerrar formulario": {
    "es": "Cerrar formulario",
    "en": "Close form",
    "pt": "Fechar formulário",
    "fr": "Fermer le formulaire"
  },
  "Registra sus datos para crear una cuenta activa.": {
    "es": "Registra sus datos para crear una cuenta activa.",
    "en": "Enter her details to create an active account.",
    "pt": "Preencha os dados para criar uma conta ativa.",
    "fr": "Renseignez ses informations pour créer un compte actif."
  },
  "¿Descartar los datos?": {
    "es": "¿Descartar los datos?",
    "en": "Discard entered details?",
    "pt": "Descartar os dados?",
    "fr": "Abandonner les données ?"
  },
  "Los datos introducidos se perderán. Todavía no se ha creado la cuenta.": {
    "es": "Los datos introducidos se perderán. Todavía no se ha creado la cuenta.",
    "en": "The entered details will be lost. The account has not been created yet.",
    "pt": "Os dados serão perdidos. A conta ainda não foi criada.",
    "fr": "Les données saisies seront perdues. Le compte n’a pas encore été créé."
  },
  "Seguir completando": {
    "es": "Seguir completando",
    "en": "Continue filling out",
    "pt": "Continuar preenchendo",
    "fr": "Continuer la saisie"
  },
  "Descartar y cerrar": {
    "es": "Descartar y cerrar",
    "en": "Discard and close",
    "pt": "Descartar e fechar",
    "fr": "Abandonner et fermer"
  },
  "Usuaria creada · Cuenta activa": {
    "es": "Usuaria creada · Cuenta activa",
    "en": "User created · Active account",
    "pt": "Usuária criada · Conta ativa",
    "fr": "Utilisatrice créée · Compte actif"
  },
  "La usuaria ya puede iniciar sesión con su usuario o correo y la contraseña inicial, sin códigos de verificación. Al ingresar deberá aceptar las condiciones de uso.": {
    "es": "La usuaria ya puede iniciar sesión con su usuario o correo y la contraseña inicial, sin códigos de verificación. Al ingresar deberá aceptar las condiciones de uso.",
    "en": "The user can sign in with her username or email and initial password, without verification codes. She must accept the terms after signing in.",
    "pt": "A usuária já pode entrar com seu usuário ou e-mail e a senha inicial, sem códigos de verificação. Ao entrar, deverá aceitar os termos de uso.",
    "fr": "L’utilisatrice peut se connecter avec son identifiant ou e-mail et son mot de passe initial, sans code de vérification. Elle devra accepter les conditions après connexion."
  },
  "Enviando código…": {
    "es": "Enviando código…",
    "en": "Sending code…",
    "pt": "Enviando código…",
    "fr": "Envoi du code…"
  },
  "Reenviar código al correo": {
    "es": "Reenviar código al correo",
    "en": "Resend email code",
    "pt": "Reenviar código por e-mail",
    "fr": "Renvoyer le code par e-mail"
  },
  "Enviar código al correo": {
    "es": "Enviar código al correo",
    "en": "Send email code",
    "pt": "Enviar código por e-mail",
    "fr": "Envoyer le code par e-mail"
  },
  "Código enviado al correo registrado.": {
    "es": "Código enviado al correo registrado.",
    "en": "Code sent to the registered email.",
    "pt": "Código enviado ao e-mail cadastrado.",
    "fr": "Code envoyé à l’adresse e-mail enregistrée."
  },
  "Continuar la verificación en el dispositivo de la titular": {
    "es": "Continuar la verificación en el dispositivo de la titular",
    "en": "Continue verification on the account holder’s device",
    "pt": "Continuar a verificação no dispositivo da titular",
    "fr": "Continuer la vérification sur l’appareil de la titulaire"
  },
  "Crear otra usuaria": {
    "es": "Crear otra usuaria",
    "en": "Create another user",
    "pt": "Criar outra usuária",
    "fr": "Créer une autre utilisatrice"
  },
  "Cerrar": {
    "es": "Cerrar",
    "en": "Close",
    "pt": "Fechar",
    "fr": "Fermer"
  },
  "Todos los campos son obligatorios": {
    "es": "Todos los campos son obligatorios",
    "en": "All fields are required",
    "pt": "Todos os campos são obrigatórios",
    "fr": "Tous les champs sont obligatoires"
  },
  "Ocultar contraseña": {
    "es": "Ocultar contraseña",
    "en": "Hide password",
    "pt": "Ocultar senha",
    "fr": "Masquer le mot de passe"
  },
  "Mostrar contraseña": {
    "es": "Mostrar contraseña",
    "en": "Show password",
    "pt": "Mostrar senha",
    "fr": "Afficher le mot de passe"
  },
  "Ocultar": {
    "es": "Ocultar",
    "en": "Hide",
    "pt": "Ocultar",
    "fr": "Masquer"
  },
  "Mostrar": {
    "es": "Mostrar",
    "en": "Show",
    "pt": "Mostrar",
    "fr": "Afficher"
  },
  "✓ Formato válido": {
    "es": "✓ Formato válido",
    "en": "✓ Valid format",
    "pt": "✓ Formato válido",
    "fr": "✓ Format valide"
  },
  "La cuenta quedará activa, sin verificación adicional.": {
    "es": "La cuenta quedará activa, sin verificación adicional.",
    "en": "The account will be active, with no additional verification.",
    "pt": "A conta ficará ativa, sem verificação adicional.",
    "fr": "Le compte sera actif, sans vérification supplémentaire."
  },
  "Cancelar": {
    "es": "Cancelar",
    "en": "Cancel",
    "pt": "Cancelar",
    "fr": "Annuler"
  },
  "Creando cuenta…": {
    "es": "Creando cuenta…",
    "en": "Creating account…",
    "pt": "Criando conta…",
    "fr": "Création du compte…"
  },
  "Crear cuenta": {
    "es": "Crear cuenta",
    "en": "Create account",
    "pt": "Criar conta",
    "fr": "Créer le compte"
  },
  "Creando cuenta. Espera un momento.": {
    "es": "Creando cuenta. Espera un momento.",
    "en": "Creating account. Please wait.",
    "pt": "Criando conta. Aguarde um momento.",
    "fr": "Création du compte. Veuillez patienter."
  }
};

export function createUserText(text: string, language: Language): string {
  return messages[text]?.[language] ?? text;
}
