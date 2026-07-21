import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  User? _currentUser;
  bool _loading = true;

  AuthProvider() {
    _authService.authStateChanges.listen((User? user) {
      _currentUser = user;
      _loading = false;
      notifyListeners();
    });
  }

  User? get currentUser => _currentUser;
  bool get loading => _loading;

  Future<void> signInWithEmail(String email, String password) async {
    await _authService.signInWithEmail(email, password);
  }

  Future<void> signUpWithEmail(String email, String password) async {
    await _authService.signUpWithEmail(email, password);
  }

  Future<void> signInWithGoogle() async {
    await _authService.signInWithGoogle();
  }

  Future<void> signOut() async {
    await _authService.signOut();
  }
}
