import 'dart:async';
import 'package:flutter/material.dart';
import '../models/project.dart';
import '../services/firestore_service.dart';

class ProjectProvider extends ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();
  String _userId = '';
  StreamSubscription<List<Project>>? _projectSub;

  List<Project> _projects = [];
  List<Project> get projects => _projects;
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // Selected task state
  String? _selectedProjectId;
  String? _selectedTopicId;
  String? _selectedSubTopicId;

  String? get selectedProjectId => _selectedProjectId;
  String? get selectedTopicId => _selectedTopicId;
  String? get selectedSubTopicId => _selectedSubTopicId;

  Project? get selectedProject {
    if (_selectedProjectId == null) return null;
    try {
      return _projects.firstWhere((p) => p.id == _selectedProjectId);
    } catch (_) {
      return null;
    }
  }

  void init(String userId) {
    if (_userId == userId) return;
    _userId = userId;
    _isLoading = true;
    notifyListeners();

    _projectSub?.cancel();
    _projectSub = _firestoreService.streamProjects(_userId).listen((data) {
      _projects = data;
      _isLoading = false;
      notifyListeners();
    });
  }

  void selectTask({String? projectId, String? topicId, String? subTopicId}) {
    _selectedProjectId = projectId;
    _selectedTopicId = topicId;
    _selectedSubTopicId = subTopicId;
    notifyListeners();
  }

  Future<void> addProject(Project project) async {
    await _firestoreService.addProject(project);
  }

  Future<void> updateProject(Project project) async {
    await _firestoreService.updateProject(project);
  }

  Future<void> deleteProject(String projectId) async {
    await _firestoreService.deleteProject(projectId);
    if (_selectedProjectId == projectId) {
      _selectedProjectId = null;
      _selectedTopicId = null;
      _selectedSubTopicId = null;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _projectSub?.cancel();
    super.dispose();
  }
}
