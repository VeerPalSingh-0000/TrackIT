import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/session_provider.dart';


class StatsBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final sessionProvider = Provider.of<SessionProvider>(context);
    final sessions = sessionProvider.sessions;

    int totalSeconds = 0;
    int totalSessions = sessions.length;
    final uniqueDays = <int>{};

    for (var session in sessions) {
      totalSeconds += session.duration;
      final d = DateTime.fromMillisecondsSinceEpoch(session.startTime);
      final dayStart = DateTime(d.year, d.month, d.day).millisecondsSinceEpoch;
      uniqueDays.add(dayStart);
    }

    final sortedDays = uniqueDays.toList()..sort((a, b) => b.compareTo(a));

    int currentStreak = 0;
    int bestStreak = 0;

    final today = DateTime.now();
    final todayTime = DateTime(today.year, today.month, today.day).millisecondsSinceEpoch;
    final yesterdayTime = todayTime - 86400000;

    int expectedNextDay = todayTime;
    bool hasTodayOrYesterday = false;

    if (sortedDays.contains(todayTime)) {
      hasTodayOrYesterday = true;
      expectedNextDay = todayTime;
    } else if (sortedDays.contains(yesterdayTime)) {
      hasTodayOrYesterday = true;
      expectedNextDay = yesterdayTime;
    }

    if (hasTodayOrYesterday) {
      for (var day in sortedDays) {
        if (day == expectedNextDay) {
          currentStreak++;
          expectedNextDay -= 86400000;
        } else {
          break;
        }
      }
    }

    int currentTempStreak = 0;
    int? expectedTempNextDay;
    for (var day in sortedDays) {
      if (expectedTempNextDay == null || day == expectedTempNextDay) {
        currentTempStreak++;
      } else {
        if (currentTempStreak > bestStreak) bestStreak = currentTempStreak;
        currentTempStreak = 1;
      }
      expectedTempNextDay = day - 86400000;
    }
    if (currentTempStreak > bestStreak) bestStreak = currentTempStreak;

    final formattedTime = _formatTime(totalSeconds);

    return LayoutBuilder(
      builder: (context, constraints) {
        return GridView.count(
          crossAxisCount: constraints.maxWidth > 400 ? 4 : 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.5,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          children: [
            _buildCard('Total Focus', formattedTime, Icons.access_time, Colors.greenAccent),
            _buildCard('Sessions', '$totalSessions', Icons.calendar_today, Colors.blueAccent),
            _buildCard('Current Streak', '$currentStreak Days', Icons.local_fire_department, Colors.orangeAccent),
            _buildCard('Best Streak', '$bestStreak Days', Icons.emoji_events, Colors.purpleAccent),
          ],
        );
      }
    );
  }

  String _formatTime(int seconds) {
    if (seconds == 0) return '0h 0m';
    int h = seconds ~/ 3600;
    int m = (seconds % 3600) ~/ 60;
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  Widget _buildCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
