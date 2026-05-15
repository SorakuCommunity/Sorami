# Firebase Setup Completion Guide for Sorami Mobile App

## ✅ Current Status:
Firebase configuration has been successfully generated for the Sorami mobile app. The following files are in place:
- `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/firebase_options.dart` - Contains configuration for all platforms
- `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/main.dart` - Updated to initialize Firebase (excluding Linux)

## 📋 Remaining Steps to Complete Firebase Setup:

### 1. Download Platform-Specific Configuration Files
You need to download these files from the Firebase Console and place them in the correct locations:

**For Android:**
1. Go to Firebase Console → Project Overview → Settings (gear icon) → Your apps → Android app
2. Click "Download google-services.json"
3. Place the file at: `/home/riu/Projects/Monorepo/Sorami/apps/mobile/android/app/google-services.json`

**For iOS:**
1. Go to Firebase Console → Project Overview → Settings (gear icon) → Your apps → iOS app
2. Click "Download GoogleService-Info.plist"
3. Place the file at: `/home/riu/Projects/Monorepo/Sorami/apps/mobile/ios/Runner/GoogleService-Info.plist`

### 2. Verify Android Gradle Setup
Ensure your Android project has the Google Services plugin:

**In `/home/riu/Projects/Monorepo/Sorami/apps/mobile/android/build.gradle`:**
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0' 
        // ... other dependencies
    }
}
```

**In `/home/riu/Projects/Monorepo/Sorami/apps/mobile/android/app/build.gradle`:**
```gradle
// Add this to the bottom of the file
apply plugin: 'com.google.gms.google-services'
```

### 3. Verify iOS Pod Setup
For iOS, you may need to add Firebase pods (though FlutterFire CLI usually handles this):

**In `/home/riu/Projects/Monorepo/Sorami/apps/mobile/ios/Podfile`:**
```ruby
# Add Firebase pods if not already present
pod 'Firebase/Core'
pod 'Firebase/Messaging'
# ... other pods
```

Then run: `cd ios && pod install`

### 4. Firebase Service Implementation Examples

#### Option A: Firebase Authentication Service
Create `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/services/firebase_auth_service.dart`:
```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);
final googleSignInProvider = Provider<GoogleSignIn>((ref) => GoogleSignIn());

class FirebaseAuthService {
  final FirebaseAuth _auth;
  final GoogleSignIn _googleSignIn;

  FirebaseAuthService(this._auth, this._googleSignIn);

  // Email/Password Authentication
  Future<User?> signInWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user;
    } on FirebaseAuthException catch (e) {
      // Handle specific errors
      if (e.code == 'user-not-found') {
        // No user found for that email
      } else if (e.code == 'wrong-password') {
        // Wrong password provided
      }
      return null;
    }
  }

  Future<User?> createUserWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential.user;
    } on FirebaseAuthException catch (e) {
      // Handle specific errors
      if (e.code == 'weak-password') {
        // Password provided is too weak
      } else if (e.code == 'email-already-in-use') {
        // Account already exists
      }
      return null;
    }
  }

  // Google Sign-In Authentication
  Future<User?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      // Obtain the auth details from the request
      final GoogleSignInAuthentication? googleAuth =
          await googleUser?.authentication;

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth?.accessToken,
        idToken: googleAuth?.idToken,
      );

      // Once signed in, return the UserCredential
      final userCredential =
          await _auth.signInWithCredential(credential);
      return userCredential.user;
    } catch (e) {
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _googleSignIn.signOut();
  }

  Stream<User?> get authStateChanges => _auth.authStateChanges();
}
```

#### Option B: Firebase Messaging Service
Create `/home/riu/Projects/Monorepo/Sorami/apps/mobile/lib/services/firebase_messaging_service.dart`:
```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

final firebaseMessagingProvider =
    Provider<FirebaseMessaging>((ref) => FirebaseMessaging.instance);
final flutterLocalNotificationsProvider =
    Provider<FlutterLocalNotificationsPlugin>((ref) => FlutterLocalNotificationsPlugin());

class FirebaseMessagingService {
  final FirebaseMessaging _messaging;
  final FlutterLocalNotificationsPlugin _localNotifications;

  FirebaseMessagingService(this._messaging, this._localNotifications);

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
      print('User granted permission for notification');
    } else {
      print('User declined or has not accepted permission');
    }

    // Get the device token
    final token = await _messaging.getToken();
    print('FCM Token: $token');

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Show local notification when app is in foreground
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;
      if (notification != null && android != null) {
        _localNotifications.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              channel.id,
              channel.name,
              channelDescription: channel.description,
              icon: android.smallIcon,
            ),
          ),
        );
      }
    });

    // Handle background messages (requires Dart entry point)
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  Future<void> _firebaseMessagingBackgroundHandler(
      RemoteMessage message) async {
    print("Handling a background message: ${message.messageId}");
  }
}

// Initialize local notifications plugin
Future<void> configureLocalNotifications() async {
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  final InitializationSettings initializationSettings =
      InitializationSettings(android: initializationSettingsAndroid);

  await flutterLocalNotificationsPlugin.initialize(initializationSettings);
}

// Define the notification channel
const AndroidNotificationChannel channel = AndroidNotificationChannel(
  'high_importance_channel', // id
  'High Importance Notifications', // name
  description: 'This channel is used for important notifications.', // description
  importance: Importance.high,
);
```

### 5. Update main.dart to Initialize Firebase Services
Update your main.dart to initialize the services you need:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
// Import your services
// import 'services/firebase_auth_service.dart';
// import 'services/firebase_messaging_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (defaultTargetPlatform != TargetPlatform.linux) {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    
    // Initialize local notifications if using Firebase Messaging
    // await configureLocalNotifications();
  }
  runApp(const ProviderScope(child: SoramiApp()));
}
```

## 🧪 Testing Your Firebase Setup

You can test if Firebase is properly initialized by adding a simple check:
```dart
// In any widget after Firebase initialization
FirebaseAuth.instance.authStateChanges().listen((User? user) {
  if (user == null) {
    print('User is currently signed out!');
  } else {
    print('User is signed in! ${user.uid}');
    print('Email: ${user.email}');
  }
});
```

## 🚫 Important Notes:

1. **Linux Platform**: Firebase doesn't officially support Linux desktop yet, which is why the code excludes Linux platform initialization. This is intentional and correct.

2. **API Keys Security**: The API keys in firebase_options.dart are safe to commit to your repository as they are only for identifying your Firebase project, not for accessing sensitive data. However, you should still follow security best practices and enable appropriate restrictions in the Firebase console.

3. **Firebase Services Selection**: Based on the original tech stack, Firebase is primarily intended for:
   - Firebase Cloud Messaging (push notifications)
   - Possibly Firebase Authentication (as an alternative/custom option)
   
   The main backend is designed to be NestJS with PostgreSQL, so you may choose to use Firebase only for specific services rather than as your primary backend.

4. **Alternative Approach**: If you decide to use Firebase as your primary backend instead of NestJS, you would replace the REST API calls with Firebase Firestore/Realtime Database calls. However, based on the original spec, it appears Firebase is meant to complement the NestJS API.

## 📱 Next Steps:

1. Download and place the platform-specific config files (google-services.json, GoogleService-Info.plist)
2. Verify your Gradle and Pod files are set up correctly
3. Implement the Firebase services you need (Auth, Messaging, etc.)
4. Test your Firebase integration
5. Begin implementing your MVP features according to TODO.md

Would you like me to create any of the specific Firebase service files mentioned above to help you get started with implementation?