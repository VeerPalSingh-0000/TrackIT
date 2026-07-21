import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../models/project.dart';
import '../providers/auth_provider.dart';
import '../providers/project_provider.dart';

class ProjectFormScreen extends StatefulWidget {
  final Project? existingProject;

  const ProjectFormScreen({Key? key, this.existingProject}) : super(key: key);

  @override
  _ProjectFormScreenState createState() => _ProjectFormScreenState();
}

class _ProjectFormScreenState extends State<ProjectFormScreen> {
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  List<Topic> _topics = [];

  @override
  void initState() {
    super.initState();
    if (widget.existingProject != null) {
      _nameController.text = widget.existingProject!.name;
      _descController.text = widget.existingProject!.description;
      _topics = List.from(widget.existingProject!.subProjects);
    }
  }

  void _addTopic() {
    setState(() {
      _topics.add(Topic(id: const Uuid().v4(), name: 'New Topic'));
    });
  }

  void _addSubTopic(int topicIndex) {
    setState(() {
      _topics[topicIndex] = Topic(
        id: _topics[topicIndex].id,
        name: _topics[topicIndex].name,
        subTopics: [
          ..._topics[topicIndex].subTopics,
          SubTopic(id: const Uuid().v4(), name: 'New Subtopic')
        ],
      );
    });
  }

  Future<void> _save() async {
    if (_nameController.text.trim().isEmpty) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final projectProvider = Provider.of<ProjectProvider>(context, listen: false);

    if (widget.existingProject == null) {
      final newProject = Project(
        id: '', // Firestore sets this
        userId: auth.currentUser!.uid,
        name: _nameController.text.trim(),
        description: _descController.text.trim(),
        subProjects: _topics,
      );
      await projectProvider.addProject(newProject);
    } else {
      final updatedProject = Project(
        id: widget.existingProject!.id,
        userId: widget.existingProject!.userId,
        name: _nameController.text.trim(),
        description: _descController.text.trim(),
        subProjects: _topics,
        createdAt: widget.existingProject!.createdAt,
      );
      await projectProvider.updateProject(updatedProject);
    }

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(widget.existingProject == null ? 'New Project' : 'Edit Project',
            style: const TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.check, color: Colors.greenAccent),
            onPressed: _save,
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _nameController,
            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(
              hintText: 'Project Name',
              hintStyle: TextStyle(color: Colors.grey),
              border: InputBorder.none,
            ),
          ),
          TextField(
            controller: _descController,
            style: const TextStyle(color: Colors.white70, fontSize: 16),
            decoration: const InputDecoration(
              hintText: 'Description (optional)',
              hintStyle: TextStyle(color: Colors.grey),
              border: InputBorder.none,
            ),
            maxLines: null,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Topics', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              TextButton.icon(
                onPressed: _addTopic,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Topic'),
              )
            ],
          ),
          const SizedBox(height: 16),
          ..._topics.asMap().entries.map((entry) {
            int i = entry.key;
            Topic topic = entry.value;
            return Card(
              color: Colors.white.withOpacity(0.05),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: topic.name,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                            onChanged: (val) {
                              _topics[i] = Topic(id: topic.id, name: val, subTopics: topic.subTopics);
                            },
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                          onPressed: () {
                            setState(() {
                              _topics.removeAt(i);
                            });
                          },
                        )
                      ],
                    ),
                    const Divider(color: Colors.white12),
                    ...topic.subTopics.asMap().entries.map((subEntry) {
                      int j = subEntry.key;
                      SubTopic subTopic = subEntry.value;
                      return Row(
                        children: [
                          const SizedBox(width: 24),
                          const Icon(Icons.subdirectory_arrow_right, color: Colors.grey, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextFormField(
                              initialValue: subTopic.name,
                              style: const TextStyle(color: Colors.white70),
                              decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                              onChanged: (val) {
                                final newSubTopics = List<SubTopic>.from(topic.subTopics);
                                newSubTopics[j] = SubTopic(id: subTopic.id, name: val);
                                _topics[i] = Topic(id: topic.id, name: topic.name, subTopics: newSubTopics);
                              },
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.grey, size: 16),
                            onPressed: () {
                              setState(() {
                                final newSubTopics = List<SubTopic>.from(topic.subTopics)..removeAt(j);
                                _topics[i] = Topic(id: topic.id, name: topic.name, subTopics: newSubTopics);
                              });
                            },
                          )
                        ],
                      );
                    }).toList(),
                    TextButton.icon(
                      onPressed: () => _addSubTopic(i),
                      icon: const Icon(Icons.add, size: 14),
                      label: const Text('Add Subtopic', style: TextStyle(fontSize: 12)),
                    )
                  ],
                ),
              ),
            );
          }).toList()
        ],
      ),
    );
  }
}
