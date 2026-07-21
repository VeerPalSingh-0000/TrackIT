import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/project.dart';
import '../providers/project_provider.dart';
import '../screens/project_form_screen.dart';

class ProjectCard extends StatefulWidget {
  final Project project;

  const ProjectCard({Key? key, required this.project}) : super(key: key);

  @override
  _ProjectCardState createState() => _ProjectCardState();
}

class _ProjectCardState extends State<ProjectCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);

    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: _expanded,
          onExpansionChanged: (val) => setState(() => _expanded = val),
          title: Text(widget.project.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          subtitle: widget.project.description.isNotEmpty
              ? Text(widget.project.description, style: const TextStyle(color: Colors.white54, fontSize: 12))
              : null,
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.edit, color: Colors.grey, size: 20),
                onPressed: () {
                  Navigator.pop(context); // Close bottom sheet
                  Navigator.push(context, MaterialPageRoute(builder: (_) => ProjectFormScreen(existingProject: widget.project)));
                },
              ),
              IconButton(
                icon: const Icon(Icons.play_circle_fill, color: Colors.greenAccent),
                onPressed: () {
                  projectProvider.selectTask(projectId: widget.project.id);
                  Navigator.pop(context); // Close bottom sheet
                },
              ),
            ],
          ),
          children: widget.project.subProjects.map((topic) {
            return Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(topic.name, style: const TextStyle(color: Colors.white70)),
                      IconButton(
                        icon: const Icon(Icons.play_circle_outline, color: Colors.greenAccent, size: 20),
                        onPressed: () {
                          projectProvider.selectTask(projectId: widget.project.id, topicId: topic.id);
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                  if (topic.subTopics.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(left: 16),
                      child: Column(
                        children: topic.subTopics.map((subTopic) {
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(subTopic.name, style: const TextStyle(color: Colors.white54, fontSize: 13)),
                              IconButton(
                                icon: const Icon(Icons.play_circle_outline, color: Colors.greenAccent, size: 16),
                                onPressed: () {
                                  projectProvider.selectTask(projectId: widget.project.id, topicId: topic.id, subTopicId: subTopic.id);
                                  Navigator.pop(context);
                                },
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
