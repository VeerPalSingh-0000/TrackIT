import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/project_provider.dart';
import 'providers/session_provider.dart';
import 'services/firestore_service.dart';

import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/welcome_screen.dart';

class FocusFlowApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'FocusFlow',
      theme: themeProvider.currentTheme,
      debugShowCheckedModeBanner: false,
      home: AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    if (authProvider.loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (authProvider.currentUser == null) {
      return AuthScreen();
    }

    // Initialize providers that depend on auth
    final uid = authProvider.currentUser!.uid;
    Provider.of<ProjectProvider>(context, listen: false).init(uid);
    Provider.of<SessionProvider>(context, listen: false).init(uid);

    return FutureBuilder<bool>(
      future: FirestoreService().hasCompletedOnboarding(uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        final hasOnboarded = snapshot.data ?? false;
        if (hasOnboarded) {
          return HomeScreen();
        } else {
          return WelcomeScreen();
        }
      },
    );
  }
}
