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
} from '@env';
import { initializeApp, getApps, getApp } from 'firebase/app'; 
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 

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
const LOGO_IMAGE_PATH = require('./assets/transparentlogo.png');
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
const LoginScreen = ({ navigateTo, onLogin, isAuthReady, authStatus }) => {
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

        <Text style={styles.dividerText}>Or login with</Text>

        <View style={styles.socialButtonRow}>
          <SocialButton icon="google" text="Google" isGoogle onPress={() => console.log('Google Pressed')} />
          <SocialButton icon="facebook" text="Facebook" onPress={() => console.log('Facebook Pressed')} />
        </View>
        
        {authStatus && <Text style={styles.authStatusText}>{authStatus}</Text>}


        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By signing up, you agree to the </Text>
          <TouchableOpacity><Text style={styles.termsLink}>Terms of Service</Text></TouchableOpacity>
          <Text style={styles.termsText}> and </Text>
          <TouchableOpacity><Text style={styles.termsLink}>Data Processing Agreement</Text></TouchableOpacity>
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

  const [countryCode] = useState('+63');

  const handleRegisterAttempt = async () => {
    setLoading(true);
    await onRegister({
      email,
      password,
      firstName,
      lastName,
      phone,
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
            <TouchableOpacity onPress={() => navigateTo('Login')}>
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
          placeholder="18/03/2024"
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
            {/* Country Picker Placeholder */}
            <View style={styles.countryCodePicker}>
                <Text style={styles.countryCodeText}>🇵🇭 {countryCode}</Text>
                <MaterialCommunityIcons name="menu-down" size={20} color={PLACEHOLDER_TEXT} />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="969-969-6969"
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

  // --- Firebase Initialization ---
  useEffect(() => {
    let authInstance, dbInstance;
    let unsubscribe = () => {};

    const configToUse = Object.keys(finalFirebaseConfig).length > 0 ? finalFirebaseConfig : null;
    
    // Check if the environment has loaded our API key from the .env file
    if (!configToUse || !configToUse.apiKey) {
        setIsAuthReady(true);
        // This message is simplified since we are using environment variables now
        return setAuthStatus("WARNING: Keys missing. Check .env file and babel.config.js setup.");
    }


    if (configToUse) {
        try {
            let firebaseApp;
            // CHECK 1: Prevent double initialization during Hot Reload
            if (getApps().length === 0) {
                firebaseApp = initializeApp(configToUse);
            } else {
                firebaseApp = getApp();
            }
            
            // INITIALIZE AUTH WITH PERSISTENCE
            // It needs the AsyncStorage package installed: npm install @react-native-async-storage/async-storage
            authInstance = initializeAuth(firebaseApp, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage)
            });
            
            dbInstance = getFirestore(firebaseApp);
            
            setAuth(authInstance);
            setDb(dbInstance);

            // Authentication Listener
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

  // --- Navigation Handlers ---
  const navigateTo = (targetScreen) => {
    setScreen(targetScreen);
    setAuthStatus(null); // Clear status when navigating
  };

  // --- Authentication Logic ---
  const handleLogin = async (email, password) => {
    if (!auth) return setAuthStatus("Error: Auth not ready.");
    
    setAuthStatus("Signing in...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthStatus("Success! Logged in as " + email);
      // You would typically navigate to a dashboard here: navigateTo('Home');
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
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Save User Details to Firestore
      // Path: /artifacts/{appId}/users/{userId}/user_data/profile
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
      navigateTo('Login'); // Navigate back to login
    } catch (error) {
      setAuthStatus(`Registration Failed: ${error.message}`);
      console.error("Registration Error:", error);
    }
  }

  if (!isAuthReady) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            <Text style={styles.loadingText}>Initializing App Services...</Text>
        </View>
    )
  }

  return (
    // Wrap the entire app with a SafeAreaProvider if needed, but since we are using SafeAreaView in the header, this is fine.
    <View style={styles.appContainer}> 
      {screen === 'Login' ? (
        <LoginScreen 
          navigateTo={navigateTo} 
          onLogin={handleLogin} 
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
    color: '#D9534F', // Red color for error messages
    fontWeight: 'bold',
  },
  headerBackground: {
    height: Platform.OS === 'ios' ? height * 0.35 : height * 0.40, // Increased height for better visual alignment
    width: '100%',
    backgroundColor: BACKGROUND_GRADIENT_START, // Fallback background color
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  // --- Background effect simulation ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46, 0.9)', // Dark blue/purple hue for depth and star visibility
  },
  // ------------------------------------
  headerContent: {
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  registerHeader: {
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoImage: {
      width: 40,
      height: 40,
      marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  registerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 5,
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 50,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: TEXT_COLOR,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    height: 50,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
    height: '100%',
  },
  inputSingle: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    height: 50,
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
    marginBottom: 30,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
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
    fontSize: 14,
    color: TEXT_COLOR,
  },
  primaryButton: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
    color: PLACEHOLDER_TEXT,
  },
  socialButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 50,
    flex: 0.48,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_COLOR,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
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
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  countryCodeText: {
    fontSize: 16,
    color: TEXT_COLOR,
  },
});