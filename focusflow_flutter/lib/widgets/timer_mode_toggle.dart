import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timer_provider.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class TimerModeToggle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final timerProvider = Provider.of<TimerProvider>(context);
    final isStopwatch = timerProvider.mode == TimerMode.stopwatch;

    return GlassCard(
      padding: const EdgeInsets.all(4),
      elevated: false,
      borderRadius: 30,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildToggle(
            context,
            'Stopwatch',
            Icons.timer_outlined,
            isStopwatch,
            () => timerProvider.setMode(TimerMode.stopwatch),
            timerProvider.isRunning,
          ),
          _buildToggle(
            context,
            'Pomodoro',
            Icons.access_time,
            !isStopwatch,
            () => timerProvider.setMode(TimerMode.pomodoro),
            timerProvider.isRunning,
          ),
        ],
      ),
    );
  }

  Widget _buildToggle(BuildContext context, String label, IconData icon,
      bool isSelected, VoidCallback onTap, bool isDisabled) {
    return GestureDetector(
      onTap: isDisabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.slate800 : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : AppTheme.slate500,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.slate500,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

