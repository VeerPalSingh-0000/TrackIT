import 'dart:async';
import 'package:flutter/material.dart';

enum TimerMode { stopwatch, pomodoro }
enum PomodoroPhase { work, shortBreak, longBreak }

class TimerProvider extends ChangeNotifier {
  TimerMode _mode = TimerMode.stopwatch;
  TimerMode get mode => _mode;

  bool _isRunning = false;
  bool get isRunning => _isRunning;

  int _elapsedSeconds = 0;
  int get elapsedSeconds => _elapsedSeconds;

  // Stopwatch specific
  int _maxSessionSeconds = 4 * 60 * 60; // 4 hours default

  // Pomodoro specific
  PomodoroPhase _pomodoroPhase = PomodoroPhase.work;
  PomodoroPhase get pomodoroPhase => _pomodoroPhase;
  int _pomodoroSecondsLeft = 25 * 60;
  int get pomodoroSecondsLeft => _pomodoroSecondsLeft;
  int _pomodoroCycle = 1;

  Timer? _timer;

  // Setters
  void setMode(TimerMode newMode) {
    if (_isRunning) return; // Prevent changing mode while running
    _mode = newMode;
    reset();
    notifyListeners();
  }

  void setMaxSessionLength(int hours) {
    _maxSessionSeconds = hours * 60 * 60;
    notifyListeners();
  }

  void start() {
    if (_isRunning) return;
    _isRunning = true;
    notifyListeners();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_mode == TimerMode.stopwatch) {
        _tickStopwatch();
      } else {
        _tickPomodoro();
      }
    });
  }

  void pause() {
    _isRunning = false;
    _timer?.cancel();
    notifyListeners();
  }

  void stop() {
    pause();
    // Usually stop implies we want to save the session and then reset.
    // That logic will be handled by the UI calling sessionProvider.saveSession()
  }

  void reset() {
    pause();
    _elapsedSeconds = 0;
    _pomodoroPhase = PomodoroPhase.work;
    _pomodoroSecondsLeft = 25 * 60;
    _pomodoroCycle = 1;
    notifyListeners();
  }

  void _tickStopwatch() {
    if (_elapsedSeconds >= _maxSessionSeconds) {
      pause();
      // Trigger session end logic (handled by listeners checking state)
    } else {
      _elapsedSeconds++;
      notifyListeners();
    }
  }

  void _tickPomodoro() {
    if (_pomodoroSecondsLeft > 0) {
      _pomodoroSecondsLeft--;
      _elapsedSeconds++; // keep track of total time spent in this session
      notifyListeners();
    } else {
      pause();
      _transitionPomodoroPhase();
    }
  }

  void _transitionPomodoroPhase() {
    if (_pomodoroPhase == PomodoroPhase.work) {
      if (_pomodoroCycle % 4 == 0) {
        _pomodoroPhase = PomodoroPhase.longBreak;
        _pomodoroSecondsLeft = 15 * 60;
      } else {
        _pomodoroPhase = PomodoroPhase.shortBreak;
        _pomodoroSecondsLeft = 5 * 60;
      }
    } else {
      _pomodoroPhase = PomodoroPhase.work;
      _pomodoroSecondsLeft = 25 * 60;
      if (_pomodoroPhase == PomodoroPhase.longBreak) {
         _pomodoroCycle = 1; // reset cycle after long break
      } else {
        _pomodoroCycle++;
      }
    }
    notifyListeners();
    // Auto start the next phase, or let user start it? 
    // Usually Pomodoro requires manual start for breaks, but let's just let UI handle it or auto start.
    // For now we just prepare the next phase.
  }

  String get formattedTime {
    int total = _mode == TimerMode.stopwatch ? _elapsedSeconds : _pomodoroSecondsLeft;
    int h = total ~/ 3600;
    int m = (total % 3600) ~/ 60;
    int s = total % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
  
  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
