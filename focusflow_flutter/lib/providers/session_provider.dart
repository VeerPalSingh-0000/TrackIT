import 'dart:async';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/session.dart';
import '../models/timer_data.dart';
import '../services/firestore_service.dart';

class SessionProvider extends ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();
  String _userId = '';

  StreamSubscription<List<StudySession>>? _sessionSub;
  StreamSubscription<TimerData>? _timerDataSub;

  List<StudySession> _sessions = [];
  List<StudySession> get sessions => _sessions;

  TimerData? _timerData;
  TimerData? get timerData => _timerData;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  void init(String userId) {
    if (_userId == userId) return;
    _userId = userId;
    _isLoading = true;
    notifyListeners();

    _sessionSub?.cancel();
    _sessionSub = _firestoreService.streamSessions(_userId).listen((data) {
      _sessions = data;
      _checkLoading();
    });

    _timerDataSub?.cancel();
    _timerDataSub = _firestoreService.streamTimerData(_userId).listen((data) {
      _timerData = data;
      _checkLoading();
    });
  }

  void _checkLoading() {
    if (_sessions.isNotEmpty || _timerData != null) {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveSession({
    required String projectId,
    required String projectName,
    String? topicId,
    String? topicName,
    String? subTopicId,
    String? subTopicName,
    required int durationSeconds,
  }) async {
    if (durationSeconds < 60) return; // Ignore sessions < 1 min

    final internalId = const Uuid().v4();
    final now = DateTime.now();
    final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final endTimeMs = now.millisecondsSinceEpoch;
    final startTimeMs = endTimeMs - (durationSeconds * 1000);

    String type = 'project';
    if (subTopicId != null) type = 'subtopic';
    else if (topicId != null) type = 'topic';

    final session = StudySession(
      id: '',
      userId: _userId,
      internalId: internalId,
      projectId: projectId,
      projectName: projectName,
      topicId: topicId,
      topicName: topicName,
      subTopicId: subTopicId,
      subTopicName: subTopicName,
      duration: durationSeconds,
      startTime: startTimeMs,
      endTime: endTimeMs,
      date: dateStr,
      type: type,
    );

    await _firestoreService.addSession(session);
    await _firestoreService.updateTimerData(
      _userId,
      projectId: projectId,
      topicId: topicId,
      subTopicId: subTopicId,
      additionalTimeMs: durationSeconds * 1000,
    );
  }

  Future<void> deleteSession(String sessionId) async {
    await _firestoreService.deleteSession(sessionId);
  }

  @override
  void dispose() {
    _sessionSub?.cancel();
    _timerDataSub?.cancel();
    super.dispose();
  }
}
