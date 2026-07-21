import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Tailwind Colors
  static const Color slate950 = Color(0xFF020617);
  static const Color slate900 = Color(0xFF0f172a);
  static const Color slate800 = Color(0xFF1e293b);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate500 = Color(0xFF64748b);
  static const Color slate400 = Color(0xFF94a3b8);
  static const Color slate300 = Color(0xFFcbd5e1);
  static const Color slate100 = Color(0xFFf1f5f9);
  
  static const Color emerald600 = Color(0xFF059669);
  static const Color emerald500 = Color(0xFF10b981);
  static const Color emerald400 = Color(0xFF34d399);
  
  static const Color rose500 = Color(0xFFf43f5e);
  static const Color amber400 = Color(0xFFfbbf24);
  static const Color indigo500 = Color(0xFF6366f1);
  static const Color purple500 = Color(0xFFa855f7);
  static const Color teal500 = Color(0xFF14b8a6);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: slate950,
      primaryColor: emerald500,
      colorScheme: const ColorScheme.dark(
        primary: emerald500,
        secondary: slate800,
        surface: slate900,
        error: rose500,
        onPrimary: slate950,
        onSecondary: slate100,
        onSurface: slate300,
      ),
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        bodyMedium: const TextStyle(color: slate300),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: slate400),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: slate900,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
      ),
      dividerColor: slate800,
    );
  }
}
