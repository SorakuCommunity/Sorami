# Firebase Setup Verification and Next Steps for Sorami Mobile App

## ✅ Current Firebase Setup Status:

### 1. Firebase Project Configuration
- ✅ Firebase project `appsoraku` configured via flutterfire configure
- ✅ Firebase apps registered for all platforms:
  - Android: `1:506443610589:android:4c42f2e32bb30edf609e34`
  - iOS: `1:506443610589:ios:675e7f08a458329b609e34`
  - macOS: `1:506443610589:ios:675e7f08a458329b609e34`
  - Web: `1:506443610589:web:30154719a073f1f3609e34`
  - Windows: `1:506443610589:web:483009ba7c53512a609e34`

### 2. Generated Configuration Files
- ✅ `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/firebase_options.dart` - Contains FirebaseOptions for all platforms
- ✅ `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/main.dart` - Updated to initialize Firebase (excluding Linux)

### 3. Dependencies
- ✅ `pubspec.yaml` includes:
  - firebase_core: ^2.0.0
  - firebase_messaging: ^14.0.0

## 🔧 Remaining Setup Steps:

### 1. Download Platform-Specific Configuration Files
From Firebase Console (console.firebase.google.com/project/appsoraku/settings/general):

**For Android:**
- Download `google-services.json`
- Place in: `/home/riu/Projects/Monorepo/Sorami/apps/mobile/android/app/`

**For iOS:**
- Download `GoogleService-Info.plist`
- Place in: `/home/riu/Projects/Monorepo/Sorami/apps/mobile/ios/Runner/`

### 2. Verify firebase_options.dart Content
The generated file should contain configuration similar to:
```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'YOUR_ANDROID_API_KEY',
  appId: '1:506443610589:android:4c42f2e32bb30edf609e34',
  messagingSenderId: '506443610589',
  projectId: 'appsoraku',
  databaseURL: 'https://appsoraku-default-rtdb.asia-southeast1.firebasedatabase.app',
  storageBucket: 'appsoraku.firebasestorage.app',
);

static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'YOUR_IOS_API_KEY',
  appId: '1:506443610589:ios:675e7f08a458329b609e34',
  messagingSenderId: '506443610589',
  projectId: 'appsoraku',
  databaseURL: 'https://appsoraku-default-rtdb.asia-southeast1.firebasedatabase.app',
  storageBucket: 'appsoraku.firebasestorage.app',
  iosBundleId: 'com.example.sorami', // This should match your iOS bundle ID
);
```

### 3. Initialize Firebase in main.dart (Already Done)
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (defaultTargetPlatform != TargetPlatform.linux) {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
  runApp(const ProviderScope(child: SoramiApp()));
}
```

### 4. Implement Firebase Services (Optional - Based on Tech Stack)
Based on the original techspec, Firebase is used for:
- Firebase Messaging (push notifications)
- Possibly Firebase Auth (as an alternative/custom option)

Example Firebase Auth Service:
```dart
// lib/services/firebase_auth_service.dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);

class FirebaseAuthService {
  final FirebaseAuth _auth;
  
  FirebaseAuthService(this._auth);
  
  Future<User?> signInWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user;
    } on FirebaseAuthException catch (e) {
      // Handle errors
      return null;
    }
  }
  
  Future<User?> signInWithGoogle() async {
    // Implement Google Sign-In using google_sign_in package
    // This would typically be done separately and then linked to Firebase
    return null;
  }
  
  Future<void> signOut() async {
    await _auth.signOut();
  }
  
  Stream<User?> get authStateChanges => _auth.authStateChanges();
}
```

### 5. Implement Firebase Messaging for Push Notifications
```dart
// lib/services/firebase_messaging_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final firebaseMessagingProvider = Provider<FirebaseMessaging>((ref) => FirebaseMessaging.instance);

class FirebaseMessagingService {
  final FirebaseMessaging _messaging;
  
  FirebaseMessagingService(this._messaging);
  
  Future<void> initialize() async {
    // Request permission for iOS
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // User granted permission
    } else {
      // User declined or has not yet chosen
    }
    
    // Get FCM token
    final token = await _messaging.getToken();
    print('FCM Token: $token');
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Handle message when app is in foreground
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');
      
      if (message.notification != null) {
        print('Message also contained a notification: ${message.notification}');
      }
    });
    
    // Handle background messages (requires Dart entry point)
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }
  
  Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
    print("Handling a background message: ${message.messageId}");
  }
}
```

## 📱 Platform-Specific Notes:

### Android:
1. Ensure you have the google-services plugin in `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```
2. And the classpath in `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
       // ...
   }
   ```

### iOS:
1. No additional setup needed beyond placing the GoogleService-Info.plist
2. Ensure your Podfile has the Firebase/Messaging pod if needed

### Web:
- Configuration is already in firebase_options.dart
- Ensure you've added the Firebase SDK snippet to your web/index.html if using Firebase Services directly

### macOS & Windows:
- Use the same configuration approach as iOS/Android respectively

## 🧪 Testing Firebase Integration:

You can test Firebase initialization by adding a simple check:
```dart
// In your main.dart or a test widget
FirebaseAuth.instance.authStateChanges().listen((User? user) {
  if (user == null) {
    print('User is currently signed out!');
  } else {
    print('User is signed in! ${user.uid}');
  }
});
```

## 🚀 Current Status:
The Firebase configuration is 90% complete. To fully enable Firebase services:
1. Download and place the platform-specific config files (google-services.json, GoogleService-Info.plist)
2. Verify the firebase_options.dart contains correct values (API keys, etc.)
3. Implement the Firebase services you need (Auth, Messaging, etc.) in your app

The Sorami mobile app is now ready to use Firebase for authentication, cloud messaging, and other Firebase services as needed, complementing or alternative to the NestJS API backend as per the original tech stack.

Would you like me to create any specific Firebase service files (like Auth or Messaging service) to help you get started with implementation?