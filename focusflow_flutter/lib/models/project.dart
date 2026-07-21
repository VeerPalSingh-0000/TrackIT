import 'package:cloud_firestore/cloud_firestore.dart';

class SubTopic {
  final String id;
  final String name;

  SubTopic({required this.id, required this.name});

  factory SubTopic.fromMap(Map<String, dynamic> data) {
    return SubTopic(
      id: data['id'] ?? '',
      name: data['name'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
    };
  }
}

class Topic {
  final String id;
  final String name;
  final List<SubTopic> subTopics;

  Topic({required this.id, required this.name, this.subTopics = const []});

  factory Topic.fromMap(Map<String, dynamic> data) {
    return Topic(
      id: data['id'] ?? '',
      name: data['name'] ?? '',
      subTopics: (data['subTopics'] as List<dynamic>?)
              ?.map((item) => SubTopic.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'subTopics': subTopics.map((e) => e.toMap()).toList(),
    };
  }
}

class Project {
  final String id;
  final String userId;
  final String name;
  final String description;
  final List<Topic> subProjects;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Project({
    required this.id,
    required this.userId,
    required this.name,
    this.description = '',
    this.subProjects = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Project.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Project(
      id: doc.id,
      userId: data['userId'] ?? '',
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      subProjects: (data['subProjects'] as List<dynamic>?)
              ?.map((item) => Topic.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'name': name,
      'description': description,
      'subProjects': subProjects.map((e) => e.toMap()).toList(),
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }
}
