import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AnimatedBackground extends StatelessWidget {
  final Widget child;
  final bool isRunning;

  const AnimatedBackground({
    Key? key,
    required this.child,
    required this.isRunning,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.slate950,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.slate950,
            isRunning ? AppTheme.slate900 : AppTheme.slate950,
            isRunning ? AppTheme.emerald600.withOpacity(0.2) : AppTheme.slate900,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Background noise / grain
          Opacity(
            opacity: 0.1,
            child: Container(
              color: Colors.black, // Placeholder for grain SVG/image
            ),
          ),
          // Actual content
          Positioned.fill(child: child),
        ],
      ),
    );
  }
}
