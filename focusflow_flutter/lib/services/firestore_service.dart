import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/project.dart';
import '../models/session.dart';
import '../models/timer_data.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // -- Projects --

  Stream<List<Project>> streamProjects(String userId) {
    return _db
        .collection('projects')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Project.fromFirestore(doc))
            .toList());
  }

  Future<void> addProject(Project project) async {
    final docRef = _db.collection('projects').doc();
    final p = Project(
      id: docRef.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      subProjects: project.subProjects,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    await docRef.set(p.toFirestore());
  }

  Future<void> updateProject(Project project) async {
    final updatedData = project.toFirestore();
    updatedData['updatedAt'] = FieldValue.serverTimestamp();
    await _db.collection('projects').doc(project.id).update(updatedData);
  }

  Future<void> deleteProject(String projectId) async {
    await _db.collection('projects').doc(projectId).delete();
  }

  // -- Sessions --

  Stream<List<StudySession>> streamSessions(String userId) {
    return _db
        .collection('sessions')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => StudySession.fromFirestore(doc))
            .toList());
  }

  Future<void> addSession(StudySession session) async {
    final docRef = _db.collection('sessions').doc();
    final s = StudySession(
      id: docRef.id,
      userId: session.userId,
      internalId: session.internalId,
      projectId: session.projectId,
      projectName: session.projectName,
      topicId: session.topicId,
      topicName: session.topicName,
      subTopicId: session.subTopicId,
      subTopicName: session.subTopicName,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
      date: session.date,
      type: session.type,
      createdAt: DateTime.now(),
    );
    await docRef.set(s.toFirestore());
  }

  Future<void> deleteSession(String sessionId) async {
    await _db.collection('sessions').doc(sessionId).delete();
  }

  // -- Timer Data --

  Stream<TimerData> streamTimerData(String userId) {
    return _db
        .collection('userTimers')
        .doc(userId)
        .snapshots()
        .map((doc) => TimerData.fromFirestore(doc));
  }

  Future<void> updateTimerData(
    String userId, {
    String? projectId,
    String? topicId,
    String? subTopicId,
    required int additionalTimeMs,
  }) async {
    final docRef = _db.collection('userTimers').doc(userId);
    final additionalSecs = (additionalTimeMs / 1000).floor();
    if (additionalSecs <= 0) return;

    final updates = <String, dynamic>{
      'updatedAt': FieldValue.serverTimestamp(),
    };

    if (projectId != null) {
      updates['timers.$projectId.totalTime'] = FieldValue.increment(additionalSecs);
    }
    if (topicId != null) {
      updates['topicTimers.$topicId.totalTime'] = FieldValue.increment(additionalSecs);
    }
    if (subTopicId != null) {
      updates['subTopicTimers.$subTopicId.totalTime'] = FieldValue.increment(additionalSecs);
    }

    await docRef.set(updates, SetOptions(merge: true));
  }

  // -- User Profiles --

  Future<bool> hasCompletedOnboarding(String userId) async {
    final doc = await _db.collection('userProfiles').doc(userId).get();
    if (!doc.exists) return false;
    final data = doc.data() as Map<String, dynamic>;
    return data['onboardingCompleted'] == true;
  }

  Future<void> setOnboardingCompleted(String userId) async {
    await _db.collection('userProfiles').doc(userId).set({
      'onboardingCompleted': true,
      'onboardingCompletedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
}
