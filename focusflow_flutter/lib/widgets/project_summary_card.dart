import 'package:flutter/material.dart';
import '../models/project.dart';
import '../models/timer_data.dart';

class ProjectSummaryCard extends StatelessWidget {
  final Project project;
  final TimerData? timerData;

  const ProjectSummaryCard({Key? key, required this.project, this.timerData}) : super(key: key);

  String _formatTime(int seconds) {
    if (seconds == 0) return '0h 0m';
    int h = seconds ~/ 3600;
    int m = (seconds % 3600) ~/ 60;
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final totalProjectTime = timerData?.getProjectTime(project.id) ?? 0;
    if (totalProjectTime == 0) return const SizedBox.shrink();

    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  project.name,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  _formatTime(totalProjectTime),
                  style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            if (project.subProjects.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(color: Colors.white12),
              const SizedBox(height: 8),
              ...project.subProjects.map((topic) {
                final topicTime = timerData?.getTopicTime(topic.id) ?? 0;
                if (topicTime == 0) return const SizedBox.shrink();
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(topic.name, style: const TextStyle(color: Colors.white70)),
                      Text(_formatTime(topicTime), style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                );
              }).toList()
            ]
          ],
        ),
      ),
    );
  }
}
