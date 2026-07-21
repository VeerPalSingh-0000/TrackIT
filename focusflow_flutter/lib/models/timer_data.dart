import 'package:cloud_firestore/cloud_firestore.dart';

class TimerData {
  final String userId;
  final Map<String, dynamic> timers; // projectId -> { totalTime: int }
  final Map<String, dynamic> topicTimers; // topicId -> { totalTime: int }
  final Map<String, dynamic> subTopicTimers; // subTopicId -> { totalTime: int }
  final DateTime? updatedAt;

  TimerData({
    required this.userId,
    this.timers = const {},
    this.topicTimers = const {},
    this.subTopicTimers = const {},
    this.updatedAt,
  });

  factory TimerData.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return TimerData(
      userId: doc.id,
      timers: data['timers'] ?? {},
      topicTimers: data['topicTimers'] ?? {},
      subTopicTimers: data['subTopicTimers'] ?? {},
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'timers': timers,
      'topicTimers': topicTimers,
      'subTopicTimers': subTopicTimers,
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }

  int getProjectTime(String projectId) {
    return (timers[projectId]?['totalTime'] as num?)?.toInt() ?? 0;
  }

  int getTopicTime(String topicId) {
    return (topicTimers[topicId]?['totalTime'] as num?)?.toInt() ?? 0;
  }

  int getSubTopicTime(String subTopicId) {
    return (subTopicTimers[subTopicId]?['totalTime'] as num?)?.toInt() ?? 0;
  }
}
