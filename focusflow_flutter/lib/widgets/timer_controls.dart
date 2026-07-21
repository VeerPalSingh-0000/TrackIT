import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timer_provider.dart';
import 'animated_button.dart';
import '../theme/app_theme.dart';

class TimerControls extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final timerProvider = Provider.of<TimerProvider>(context);
    final isRunning = timerProvider.isRunning;
    final hasStarted = timerProvider.elapsedSeconds > 0 ||
        (timerProvider.mode == TimerMode.pomodoro && timerProvider.pomodoroSecondsLeft < 25 * 60);

    return Container(
      constraints: const BoxConstraints(maxWidth: 400),
      child: Column(
        children: [
          AnimatedButton(
            variant: ButtonVariant.primary, 
            icon: const Icon(Icons.task, color: AppTheme.emerald400, size: 18),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
            onPressed: () {
              // TODO: Select Task Modal
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Select Task modal coming soon!"))
              );
            },
            child: const Text('Select Task', style: TextStyle(fontSize: 16, color: AppTheme.emerald400)),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AnimatedButton(
                  variant: isRunning ? ButtonVariant.secondary : ButtonVariant.primary,
                  icon: Icon(isRunning ? Icons.pause : Icons.play_arrow, size: 20),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                  onPressed: () {
                    if (isRunning) {
                      timerProvider.pause();
                    } else {
                      timerProvider.start();
                    }
                  },
                  child: Text(
                    isRunning ? 'Pause' : 'Start Focus',
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
              if (hasStarted) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: AnimatedButton(
                    variant: ButtonVariant.danger,
                    icon: const Icon(Icons.stop, size: 20),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                    onPressed: () {
                      timerProvider.stop();
                      timerProvider.reset();
                    },
                    child: const Text('End', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

