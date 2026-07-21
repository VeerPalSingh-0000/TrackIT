import 'package:cloud_firestore/cloud_firestore.dart';

class StudySession {
  final String id;
  final String userId;
  final String internalId;
  final String projectId;
  final String projectName;
  final String? topicId;
  final String? topicName;
  final String? subTopicId;
  final String? subTopicName;
  final int duration; // in ms
  final int startTime; // epoch ms
  final int endTime; // epoch ms
  final String date; // YYYY-MM-DD
  final String type; // project | topic | subtopic
  final DateTime? createdAt;

  StudySession({
    required this.id,
    required this.userId,
    required this.internalId,
    required this.projectId,
    required this.projectName,
    this.topicId,
    this.topicName,
    this.subTopicId,
    this.subTopicName,
    required this.duration,
    required this.startTime,
    required this.endTime,
    required this.date,
    required this.type,
    this.createdAt,
  });

  factory StudySession.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return StudySession(
      id: doc.id,
      userId: data['userId'] ?? '',
      internalId: data['internalId'] ?? '',
      projectId: data['projectId'] ?? '',
      projectName: data['projectName'] ?? '',
      topicId: data['topicId'],
      topicName: data['topicName'],
      subTopicId: data['subTopicId'],
      subTopicName: data['subTopicName'],
      duration: data['duration'] ?? 0,
      startTime: data['startTime'] ?? 0,
      endTime: data['endTime'] ?? 0,
      date: data['date'] ?? '',
      type: data['type'] ?? 'project',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'internalId': internalId,
      'projectId': projectId,
      'projectName': projectName,
      if (topicId != null) 'topicId': topicId,
      if (topicName != null) 'topicName': topicName,
      if (subTopicId != null) 'subTopicId': subTopicId,
      if (subTopicName != null) 'subTopicName': subTopicName,
      'duration': duration,
      'startTime': startTime,
      'endTime': endTime,
      'date': date,
      'type': type,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
    };
  }
}
