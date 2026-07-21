import 'package:audioplayers/audioplayers.dart';

class AudioService {
  // Cues
  final AudioPlayer _startCue = AudioPlayer();
  final AudioPlayer _endCue = AudioPlayer();
  final AudioPlayer _countdownCue = AudioPlayer();

  // Ambient
  final AudioPlayer _rainPlayer = AudioPlayer();
  final AudioPlayer _forestPlayer = AudioPlayer();
  final AudioPlayer _cafePlayer = AudioPlayer();
  final AudioPlayer _lofiPlayer = AudioPlayer();

  AudioService() {
    _initLoops();
  }

  void _initLoops() {
    _rainPlayer.setReleaseMode(ReleaseMode.loop);
    _forestPlayer.setReleaseMode(ReleaseMode.loop);
    _cafePlayer.setReleaseMode(ReleaseMode.loop);
    _lofiPlayer.setReleaseMode(ReleaseMode.loop);
  }

  // --- Cues ---
  Future<void> playStart() async {
    await _startCue.play(AssetSource('sounds/start.mp3'));
  }

  Future<void> playEnd() async {
    await _endCue.play(AssetSource('sounds/end.mp3'));
  }

  Future<void> playCountdown() async {
    await _countdownCue.play(AssetSource('sounds/countdown.mp3'));
  }

  // --- Ambient ---
  Future<void> toggleAmbient(String sound, bool play, double volume) async {
    AudioPlayer player = _getPlayer(sound);
    if (play) {
      await player.setVolume(volume);
      // Determine file extension
      String ext = sound == 'countdown' || sound == 'start' || sound == 'end' ? 'mp3' : 'ogg'; 
      // Actually we know ambient sounds are ogg
      await player.play(AssetSource('sounds/$sound.ogg'));
    } else {
      await player.pause();
    }
  }

  Future<void> setAmbientVolume(String sound, double volume) async {
    AudioPlayer player = _getPlayer(sound);
    await player.setVolume(volume);
  }

  AudioPlayer _getPlayer(String sound) {
    switch (sound) {
      case 'rain': return _rainPlayer;
      case 'forest': return _forestPlayer;
      case 'cafe': return _cafePlayer;
      case 'lofi': return _lofiPlayer;
      default: return _rainPlayer;
    }
  }

  void dispose() {
    _startCue.dispose();
    _endCue.dispose();
    _countdownCue.dispose();
    _rainPlayer.dispose();
    _forestPlayer.dispose();
    _cafePlayer.dispose();
    _lofiPlayer.dispose();
  }
}
