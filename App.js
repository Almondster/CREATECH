import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID,
    GOOGLE_WEB_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID,
    FACEBOOK_APP_ID,
} from '@env';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { initializeApp, getApps, getApp } from 'firebase/app'; 
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, initializeAuth, getReactNativePersistence, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 

WebBrowser.maybeCompleteAuthSession(); 

const USER_FIREBASE_CONFIG = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
};
const USER_APP_ID = 'createch-live-app-id';

// --- Constants and Colors ---
const { height } = Dimensions.get('window');
const PRIMARY_BLUE = '#1E6FEE';
const TEXT_COLOR = '#000000';
const PLACEHOLDER_TEXT = '#9CA3AF';
const BACKGROUND_GRADIENT_START = '#1A1A1A';
const BORDER_COLOR = '#D1D5DB';

// Define the asset path (MUST BE LOCAL)
const LOGO_IMAGE_PATH = require('./assets/transparentlogo.png');

// Country codes data
const COUNTRY_CODES = [
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

// --- Firebase Globals (Fallbacks) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = Object.keys(firebaseConfig).length > 0 ? __app_id : USER_APP_ID;
// Use .env config unless global environment config is provided
const finalFirebaseConfig = (FIREBASE_API_KEY) ? USER_FIREBASE_CONFIG : firebaseConfig; 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// --- Custom Components ---
const HeaderBackground = ({ children }) => (
  <View style={styles.headerBackground}>
    {/* Simple background simulation for dark, starry theme */}
    <View style={styles.overlay} />
    {/* SafeAreaView from 'react-native-safe-area-context' to fix deprecation warning */}
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}> 
      {children}
    </SafeAreaView>
  </View>
);

const CustomTextInput = ({ label, placeholder, secureTextEntry = false, icon, onIconPress, style, value, onChangeText, keyboardType = 'default', autoCapitalize = 'none' }) => (
  <View style={style}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_TEXT}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {icon && (
        <TouchableOpacity style={styles.inputIcon} onPress={onIconPress}>
          <Ionicons name={icon} size={20} color={PLACEHOLDER_TEXT} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const SocialButton = ({ icon, text, onPress, isGoogle = false }) => (
  <TouchableOpacity style={[styles.socialButton, isGoogle ? styles.googleButton : styles.facebookButton]} onPress={onPress}>
    <FontAwesome name={icon} size={24} color={isGoogle ? '#DB4437' : '#4267B2'} />
    <Text style={styles.socialButtonText}>{text}</Text>
  </TouchableOpacity>
);

// Country Picker Component
const CountryPicker = ({ visible, onClose, onSelect, selectedCountry }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={TEXT_COLOR} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.countryList}>
          {COUNTRY_CODES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryItem,
                selectedCountry?.code === country.code && styles.selectedCountryItem
              ]}
              onPress={() => {
                onSelect(country);
                onClose();
              }}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text style={styles.countryName}>{country.name}</Text>
              <Text style={styles.countryCode}>{country.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Logo
const CreateCHLogo = () => (
    <View style={styles.logoContainer}>
        <Image 
            source={LOGO_IMAGE_PATH} 
            style={styles.logoImage} 
            resizeMode="contain"
        />
        <Text style={styles.logoText}>CreaTECH</Text>
    </View>
);


// --- Screens ---
const LoginScreen = ({ navigateTo, onLogin, onGoogleLogin, onFacebookLogin, isAuthReady, authStatus }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(''); // Empty initial state for actual input
  const [password, setPassword] = useState(''); // Empty initial state for actual input
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginAttempt = async () => {
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <HeaderBackground>
        <View style={styles.headerContent}>
          <CreateCHLogo />
          <Text style={styles.title}>Sign in to your Account</Text>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitle}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigateTo('Register')}>
              <Text style={styles.linkText}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </HeaderBackground>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <CustomTextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.inputGroup}
          autoCapitalize="none"
        />
        <CustomTextInput
          label="Password"
          placeholder="Password"
          secureTextEntry={!showPassword}
          icon={showPassword ? 'eye-off' : 'eye'}
          onIconPress={() => setShowPassword(!showPassword)}
          value={password}
          onChangeText={setPassword}
          style={styles.inputGroup}
        />

        <View style={styles.rowBetween}>
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rowCenter}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Ionicons name="checkmark-sharp" size={14} color="#FFF" />}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkTextBlue}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLoginAttempt} disabled={!isAuthReady || loading || !email || !password}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonRow}>
          <SocialButton icon="google" text="Google" isGoogle onPress={onGoogleLogin} />
          <SocialButton icon="facebook" text="Facebook" onPress={onFacebookLogin} />
        </View>
        
        {authStatus && <Text style={styles.authStatusText}>{authStatus}</Text>}


        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By signing up, you agree to the </Text>
          <TouchableOpacity><Text style={styles.termsLink}>Terms of Service</Text></TouchableOpacity>
          <Text style={styles.termsText}> and </Text>
          <TouchableOpacity><Text style={styles.termsLink}>Privacy Policy</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const RegisterScreen = ({ navigateTo, onRegister, isAuthReady, authStatus }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(''); // Date of Birth
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to Philippines
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleRegisterAttempt = async () => {
    setLoading(true);
    await onRegister({
      email,
      password,
      firstName,
      lastName,
      phone: selectedCountry.code + phone,
      dateOfBirth: date,
    });
    setLoading(false);
  }

  // Dummy components for input fields
  const TextInputField = ({ label, placeholder, value, onChangeText, style = {} , keyboardType = 'default', secureTextEntry = false, autoCapitalize = 'sentences' }) => (
    <View style={style}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.inputSingle}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_TEXT}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBackground>
        <View style={[styles.headerContent, styles.registerHeader]}>
          <View style={styles.rowBetween}>
            <TouchableOpacity onPress={() => navigateTo('Login')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.registerTitle}>Register</Text>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitle}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigateTo('Login')}>
              <Text style={styles.linkText}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </HeaderBackground>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* First Name / Last Name Row */}
        <View style={styles.rowSpread}>
          <TextInputField label="First Name" placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.halfInput} />
          <TextInputField label="Last Name" placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.halfInput} />
        </View>

        {/* Email */}
        <TextInputField 
          label="Email" 
          placeholder="youremailexample@gmail.com" 
          value={email} 
          onChangeText={setEmail} 
          style={styles.inputGroup} 
          keyboardType="email-address" 
          autoCapitalize="none"
        />
        
        {/* Birth of Date */}
        <CustomTextInput
          label="Birth of date"
          placeholder="DD/MM/YYYY"
          icon="calendar-outline"
          value={date}
          onChangeText={setDate}
          style={styles.inputGroup}
          keyboardType="numbers-and-punctuation"
        />

        {/* Phone Number (Complex Input) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.inputContainer}>
            {/* Country Picker */}
            <TouchableOpacity 
              style={styles.countryCodePicker}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryCodeText}>{selectedCountry.flag} {selectedCountry.code}</Text>
              <MaterialCommunityIcons name="menu-down" size={20} color={PLACEHOLDER_TEXT} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="9123456789"
              placeholderTextColor={PLACEHOLDER_TEXT}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>
        
        {/* Password */}
        <CustomTextInput
          label="Set Password"
          placeholder="Password"
          secureTextEntry={!showPassword}
          icon={showPassword ? 'eye-off' : 'eye'}
          onIconPress={() => setShowPassword(!showPassword)}
          value={password}
          onChangeText={setPassword}
          style={styles.inputGroup}
        />

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 30 }]} onPress={handleRegisterAttempt} disabled={!isAuthReady || loading || !email || !password || !firstName}>
           {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Register</Text>
          )}
        </TouchableOpacity>
        
        {authStatus && <Text style={styles.authStatusText}>{authStatus}</Text>}

        {/* Country Picker Modal */}
        <CountryPicker
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
          onSelect={setSelectedCountry}
          selectedCountry={selectedCountry}
        />

      </ScrollView>
    </View>
  );
};

// --- Main App Component ---
export default function App() {
  const [screen, setScreen] = useState('Login');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);

  // --- Google Sign-in Setup ---
  const [requestGoogle, responseGoogle, promptAsyncGoogle] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: 'com.mobprog.createch://', 
  });
  
  // --- Facebook Sign-in Setup ---
  const [requestFacebook, responseFacebook, promptAsyncFacebook] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: 'com.mobprog.createch://', 
  });

  // --- Firebase Initialization ---
  useEffect(() => {
    let authInstance, dbInstance;
    let unsubscribe = () => {};

    const configToUse = Object.keys(finalFirebaseConfig).length > 0 && finalFirebaseConfig.apiKey ? finalFirebaseConfig : null;
    
    // Check if the environment has loaded our API key from the .env file
    if (!configToUse) {
        setIsAuthReady(true);
        return setAuthStatus("WARNING: Keys missing. Check .env file and babel.config.js setup.");
    }

    if (configToUse) {
        try {
            let firebaseApp;
            if (getApps().length === 0) {
                firebaseApp = initializeApp(configToUse);
            } else {
                firebaseApp = getApp();
            }
            
            authInstance = initializeAuth(firebaseApp, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage)
            });
            
            dbInstance = getFirestore(firebaseApp);
            
            setAuth(authInstance);
            setDb(dbInstance);

            unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                if (!currentUser) {
                    if (initialAuthToken) {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                }
                setUser(authInstance.currentUser);
                setIsAuthReady(true);
            });
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsAuthReady(true);
            setAuthStatus("Error: Firebase initialization failed. Check config structure.");
        }
    }
    
    return () => unsubscribe();
  }, []);
  
  // --- Google Sign-in Effect ---
  useEffect(() => {
    if (responseGoogle?.type === 'success' && auth) {
      const { id_token } = responseGoogle.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      setAuthStatus("Signing in with Google...");
      signInWithCredential(auth, credential)
        .then(() => {
          setAuthStatus("Success! Logged in with Google.");
        })
        .catch(error => {
          setAuthStatus(`Google Login Failed: ${error.message}`);
          console.error("Google Login Error:", error);
        });
    }
  }, [responseGoogle, auth]);
  
  // --- Facebook Sign-in Effect ---
  useEffect(() => {
    if (responseFacebook?.type === 'success' && auth) {
      const { access_token } = responseFacebook.params;
      const credential = FacebookAuthProvider.credential(access_token);
      
      setAuthStatus("Signing in with Facebook...");
      signInWithCredential(auth, credential)
        .then(() => {
          setAuthStatus("Success! Logged in with Facebook.");
        })
        .catch(error => {
          setAuthStatus(`Facebook Login Failed: ${error.message}`);
          console.error("Facebook Login Error:", error);
        });
    }
  }, [responseFacebook, auth]);

  // --- Navigation Handlers ---
  const navigateTo = (targetScreen) => {
    setScreen(targetScreen);
    setAuthStatus(null);
  };

  // --- Authentication Logic ---
  const handleLogin = async (email, password) => {
    if (!auth) return setAuthStatus("Error: Auth not ready.");
    
    setAuthStatus("Signing in...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthStatus("Success! Logged in as " + email);
    } catch (error) {
      setAuthStatus(`Login Failed: ${error.message}`);
      console.error("Login Error:", error);
    }
  }

  const handleRegister = async (registrationData) => {
    const { email, password, firstName, lastName, phone, dateOfBirth } = registrationData;

    if (!auth || !db) return setAuthStatus("Error: Services not ready.");
    if (password.length < 6) return setAuthStatus("Registration Failed: Password must be at least 6 characters.");

    setAuthStatus("Registering...");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/user_data`, 'profile');
      await setDoc(userDocRef, {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        createdAt: new Date().toISOString(),
      });

      setAuthStatus("Success! Account created and details saved.");
      navigateTo('Login');
    } catch (error) {
      setAuthStatus(`Registration Failed: ${error.message}`);
      console.error("Registration Error:", error);
    }
  }
  
  // --- Social Login Launchers ---
  const onGoogleLogin = () => {
    if (requestGoogle) {
        promptAsyncGoogle();
    } else {
        setAuthStatus("Google setup incomplete. Check GOOGLE_WEB_CLIENT_ID and GOOGLE_ANDROID_CLIENT_ID in .env");
    }
  };
  
  const onFacebookLogin = () => {
    if (requestFacebook) {
        promptAsyncFacebook();
    } else {
        setAuthStatus("Facebook setup incomplete. Check App ID in code and app.json");
    }
  };

  if (!isAuthReady) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            <Text style={styles.loadingText}>Initializing App Services...</Text>
        </View>
    )
  }

  return (
    <View style={styles.appContainer}> 
      {screen === 'Login' ? (
        <LoginScreen 
          navigateTo={navigateTo} 
          onLogin={handleLogin} 
          onGoogleLogin={onGoogleLogin}
          onFacebookLogin={onFacebookLogin}
          isAuthReady={isAuthReady} 
          authStatus={authStatus}
        />
      ) : (
        <RegisterScreen 
          navigateTo={navigateTo} 
          onRegister={handleRegister} 
          isAuthReady={isAuthReady} 
          authStatus={authStatus}
        />
      )}
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
  },
  loadingText: {
      marginTop: 10,
      color: PRIMARY_BLUE,
      fontSize: 16,
  },
  authStatusText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#D9534F',
    fontWeight: 'bold',
  },
  headerBackground: {
    height: Platform.OS === 'ios' ? height * 0.25 : height * 0.28,
    width: '100%',
    backgroundColor: BACKGROUND_GRADIENT_START,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46, 0.9)',
  },
  headerContent: {
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  registerHeader: {
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 40 : 40,
    paddingBottom: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoImage: {
      width: 40,
      height: 40,
      marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  registerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
    marginBottom: 8,
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  subTitle: {
    fontSize: 14,
    color: '#CCC',
  },
  linkText: {
    fontSize: 14,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  linkTextBlue: {
    fontSize: 14,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    height: 56,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
    height: '100%',
  },
  inputSingle: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    height: 56,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputIcon: {
    paddingLeft: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  rememberMeText: {
    fontSize: 15,
    color: TEXT_COLOR,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_COLOR,
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: PLACEHOLDER_TEXT,
    fontWeight: '500',
  },
  socialButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 56,
    flex: 0.48,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 5,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_COLOR,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  termsLink: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // Register Screen Specific Styles
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    width: '48%',
  },
  countryCodePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1.5,
    borderRightColor: BORDER_COLOR,
  },
  countryCodeText: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontWeight: '500',
  },
  backButton: {
    padding: 5,
    marginBottom: 5,
  },
  // Country Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  closeButton: {
    padding: 5,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCountryItem: {
    backgroundColor: '#f0f8ff',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  countryCode: {
    fontSize: 14,
    color: PLACEHOLDER_TEXT,
    fontWeight: '500',
  },
});