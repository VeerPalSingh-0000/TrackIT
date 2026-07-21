import 'package:flutter/material.dart';
import '../services/audio_service.dart';

class AudioProvider extends ChangeNotifier {
  final AudioService _audioService = AudioService();

  final Map<String, bool> _activeSounds = {
    'rain': false,
    'forest': false,
    'cafe': false,
    'lofi': false,
  };

  final Map<String, double> _volumes = {
    'rain': 0.5,
    'forest': 0.5,
    'cafe': 0.5,
    'lofi': 0.5,
  };

  bool isPlaying(String sound) => _activeSounds[sound] ?? false;
  double getVolume(String sound) => _volumes[sound] ?? 0.5;

  void toggleSound(String sound) {
    bool current = _activeSounds[sound] ?? false;
    _activeSounds[sound] = !current;
    _audioService.toggleAmbient(sound, !current, _volumes[sound] ?? 0.5);
    notifyListeners();
  }

  void setVolume(String sound, double volume) {
    _volumes[sound] = volume;
    if (_activeSounds[sound] == true) {
      _audioService.setAmbientVolume(sound, volume);
    }
    notifyListeners();
  }

  Future<void> playStartCue() => _audioService.playStart();
  Future<void> playEndCue() => _audioService.playEnd();
  Future<void> playCountdownCue() => _audioService.playCountdown();

  @override
  void dispose() {
    _audioService.dispose();
    super.dispose();
  }
}
