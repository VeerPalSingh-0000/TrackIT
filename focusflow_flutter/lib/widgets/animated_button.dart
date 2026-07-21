import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum ButtonVariant { primary, secondary, danger, glass, ghost }

class AnimatedButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final Widget? icon;
  final ButtonVariant variant;
  final EdgeInsetsGeometry padding;

  const AnimatedButton({
    Key? key,
    required this.child,
    this.onPressed,
    this.icon,
    this.variant = ButtonVariant.primary,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
  }) : super(key: key);

  @override
  _AnimatedButtonState createState() => _AnimatedButtonState();
}

class _AnimatedButtonState extends State<AnimatedButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  BoxDecoration _getDecoration() {
    final disabled = widget.onPressed == null;
    
    switch (widget.variant) {
      case ButtonVariant.primary:
        return BoxDecoration(
          color: disabled ? AppTheme.slate700 : AppTheme.emerald600,
          borderRadius: BorderRadius.circular(12),
          boxShadow: disabled ? [] : [
            BoxShadow(
              color: AppTheme.emerald500.withOpacity(0.3),
              blurRadius: 20,
              spreadRadius: 0,
            )
          ],
        );
      case ButtonVariant.secondary:
        return BoxDecoration(
          color: AppTheme.slate800,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
            )
          ],
        );
      case ButtonVariant.glass:
        return BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        );
      case ButtonVariant.danger:
        return BoxDecoration(
          color: AppTheme.rose500.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.rose500.withOpacity(0.2)),
        );
      case ButtonVariant.ghost:
        return BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        );
    }
  }

  Color _getTextColor() {
    final disabled = widget.onPressed == null;
    if (disabled) return AppTheme.slate500;
    
    switch (widget.variant) {
      case ButtonVariant.primary:
        return AppTheme.slate950;
      case ButtonVariant.secondary:
      case ButtonVariant.glass:
        return Colors.white;
      case ButtonVariant.danger:
        return AppTheme.rose500;
      case ButtonVariant.ghost:
        return AppTheme.slate300;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null ? (_) => _controller.forward() : null,
      onTapUp: widget.onPressed != null ? (_) {
        _controller.reverse();
        widget.onPressed!();
      } : null,
      onTapCancel: widget.onPressed != null ? () => _controller.reverse() : null,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: widget.padding,
          decoration: _getDecoration(),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.icon != null) ...[
                IconTheme(
                  data: IconThemeData(color: _getTextColor(), size: 18),
                  child: widget.icon!,
                ),
                const SizedBox(width: 8),
              ],
              DefaultTextStyle(
                style: TextStyle(
                  color: _getTextColor(),
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                  fontFamily: 'Inter',
                ),
                child: widget.child,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
