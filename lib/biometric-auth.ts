/**
 * Biometric Authentication using Web Authentication API (WebAuthn)
 * Supports Face ID (iOS/macOS), Fingerprint (Android/iOS), Windows Hello
 * Works on both Apple and Android devices
 */

const BIOMETRIC_CREDENTIALS_KEY = 'conectia-biometric-credentials'
const BIOMETRIC_USER_KEY = 'conectia-biometric-user'
const BIOMETRIC_LOGIN_KEY = 'conectia-biometric-login'

// Check if the browser supports WebAuthn
export function isBiometricAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  )
}

// Check if platform authenticator (Face ID / Fingerprint) is available
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricAvailable()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// Check if user has registered biometric credentials
export function hasBiometricCredentials(): boolean {
  if (typeof window === 'undefined') return false
  const creds = localStorage.getItem(BIOMETRIC_CREDENTIALS_KEY)
  return !!creds
}

// Get the stored user info for biometric login
export function getBiometricUser(): { email: string; nombre?: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(BIOMETRIC_USER_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// Generate a random challenge for WebAuthn
function generateChallenge(): Uint8Array {
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)
  return challenge
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert base64 string to ArrayBuffer  
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Register biometric credentials for a user
 * Call this after successful password login to set up Face ID / Fingerprint
 */
export async function registerBiometric(email: string, nombre?: string): Promise<boolean> {
  if (!isBiometricAvailable()) {
    throw new Error('Tu dispositivo no soporta autenticación biométrica')
  }

  const available = await isPlatformAuthenticatorAvailable()
  if (!available) {
    throw new Error('No se detectó sensor biométrico (Face ID / Huella)')
  }

  try {
    const challenge = generateChallenge()
    const userId = new TextEncoder().encode(email)

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge as BufferSource,
      rp: {
        name: 'CONECTIA',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: email,
        displayName: nombre || email,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Force platform (Face ID / Fingerprint)
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    }

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential

    if (!credential) {
      throw new Error('No se pudo crear la credencial biométrica')
    }

    // Store credential ID for later authentication
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      registeredAt: new Date().toISOString(),
    }

    localStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentialData))
    localStorage.setItem(BIOMETRIC_USER_KEY, JSON.stringify({ email, nombre }))

    return true
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Autenticación biométrica cancelada por el usuario')
    }
    if (error.name === 'SecurityError') {
      throw new Error('Error de seguridad. Asegúrate de usar HTTPS.')
    }
    throw error
  }
}

/**
 * Authenticate using biometric credentials (Face ID / Fingerprint)
 * Returns the stored email for the user to complete login
 */
export async function authenticateWithBiometric(): Promise<{ email: string; nombre?: string }> {
  if (!isBiometricAvailable()) {
    throw new Error('Tu dispositivo no soporta autenticación biométrica')
  }

  const storedCreds = localStorage.getItem(BIOMETRIC_CREDENTIALS_KEY)
  if (!storedCreds) {
    throw new Error('No hay credenciales biométricas registradas. Inicia sesión con tu contraseña primero.')
  }

  const storedUser = getBiometricUser()
  if (!storedUser) {
    throw new Error('No se encontraron datos del usuario')
  }

  try {
    const credentialData = JSON.parse(storedCreds)
    const challenge = generateChallenge()

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge as BufferSource,
      allowCredentials: [
        {
          id: base64ToArrayBuffer(credentialData.rawId),
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    }

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential

    if (!assertion) {
      throw new Error('Autenticación biométrica fallida')
    }

    // Biometric verification successful
    return storedUser
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Autenticación biométrica cancelada')
    }
    if (error.name === 'SecurityError') {
      throw new Error('Error de seguridad. Asegúrate de usar HTTPS.')
    }
    throw error
  }
}

/**
 * Store login credentials securely (called after successful password login)
 * These are used to re-authenticate after biometric verification
 */
export function storeBiometricLoginData(email: string, password: string): void {
  if (typeof window === 'undefined') return
  // Encode credentials (not true encryption, but obfuscated in localStorage)
  const data = btoa(JSON.stringify({ e: email, p: password, t: Date.now() }))
  localStorage.setItem(BIOMETRIC_LOGIN_KEY, data)
}

/**
 * Retrieve stored login credentials after biometric verification
 */
export function getBiometricLoginData(): { email: string; password: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(BIOMETRIC_LOGIN_KEY)
    if (!data) return null
    const decoded = JSON.parse(atob(data))
    return { email: decoded.e, password: decoded.p }
  } catch {
    return null
  }
}

/**
 * Remove stored biometric credentials
 */
export function removeBiometricCredentials(): void {
  localStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY)
  localStorage.removeItem(BIOMETRIC_USER_KEY)
  localStorage.removeItem(BIOMETRIC_LOGIN_KEY)
}
