import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import '../screens/project_form_screen.dart';
import 'project_card.dart';

class TaskSelectionSheet extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Select Task', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add, color: Colors.greenAccent),
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ProjectFormScreen()));
                },
              )
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: projectProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : projectProvider.projects.isEmpty
                    ? const Center(child: Text('No projects yet', style: TextStyle(color: Colors.white54)))
                    : ListView.builder(
                        itemCount: projectProvider.projects.length,
                        itemBuilder: (context, index) {
                          final project = projectProvider.projects[index];
                          return ProjectCard(project: project);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
