import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/project_provider.dart';
import '../providers/session_provider.dart';
import '../widgets/stats_bar.dart';
import '../widgets/streak_calendar.dart';
import '../widgets/project_summary_card.dart';

class HistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFF020617), // slate-950
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text('Study History', style: TextStyle(color: Colors.white)),
          bottom: const TabBar(
            indicatorColor: Colors.greenAccent,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white54,
            tabs: [
              Tab(text: 'Summary'),
              Tab(text: 'Timeline'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildSummaryTab(context),
            _buildTimelineTab(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryTab(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);
    final sessionProvider = Provider.of<SessionProvider>(context);

    if (sessionProvider.isLoading || projectProvider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        StatsBar(),
        const SizedBox(height: 24),
        StreakCalendar(),
        const SizedBox(height: 24),
        const Text('Time by Project', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        ...projectProvider.projects.map((p) {
          return ProjectSummaryCard(project: p, timerData: sessionProvider.timerData);
        }).toList(),
      ],
    );
  }

  Widget _buildTimelineTab(BuildContext context) {
    final sessionProvider = Provider.of<SessionProvider>(context);
    
    if (sessionProvider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final sessions = sessionProvider.sessions;
    if (sessions.isEmpty) {
      return const Center(child: Text('No sessions yet', style: TextStyle(color: Colors.white54)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sessions.length,
      itemBuilder: (context, index) {
        final session = sessions[index];
        final start = DateTime.fromMillisecondsSinceEpoch(session.startTime);
        final end = DateTime.fromMillisecondsSinceEpoch(session.endTime);
        final timeFormat = DateFormat('h:mm a');
        final dateFormat = DateFormat('MMM d, yyyy');

        int m = session.duration ~/ 60;
        
        return Card(
          color: Colors.white.withOpacity(0.05),
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(session.projectName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text('${dateFormat.format(start)} • ${timeFormat.format(start)} - ${timeFormat.format(end)}', 
                           style: const TextStyle(color: Colors.white54, fontSize: 12)),
            trailing: Text('${m}m', style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        );
      },
    );
  }
}
