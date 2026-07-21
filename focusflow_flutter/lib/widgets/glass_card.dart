import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double blur;
  final double borderRadius;
  final bool elevated;

  const GlassCard({
    Key? key,
    required this.child,
    this.padding,
    this.blur = 16.0,
    this.borderRadius = 16.0,
    this.elevated = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: elevated
                ? AppTheme.slate800.withOpacity(0.75)
                : AppTheme.slate900.withOpacity(0.70),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: AppTheme.slate100.withOpacity(elevated ? 0.15 : 0.10),
              width: 1,
            ),
            boxShadow: elevated
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 40,
                      offset: const Offset(0, 20),
                    )
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    )
                  ],
          ),
          child: child,
        ),
      ),
    );
  }
}
