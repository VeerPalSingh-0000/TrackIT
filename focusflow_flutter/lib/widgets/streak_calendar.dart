import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/session_provider.dart';

class StreakCalendar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final sessionProvider = Provider.of<SessionProvider>(context);
    final sessions = sessionProvider.sessions;

    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);

    final durationMap = <int, int>{};
    for (var session in sessions) {
      final d = DateTime.fromMillisecondsSinceEpoch(session.startTime);
      final dayStart = DateTime(d.year, d.month, d.day).millisecondsSinceEpoch;
      durationMap[dayStart] = (durationMap[dayStart] ?? 0) + session.duration;
    }

    final days = <Map<String, dynamic>>[];
    for (int i = 29; i >= 0; i--) {
      final d = todayStart.subtract(Duration(days: i));
      final timeKey = d.millisecondsSinceEpoch;
      days.push({
        'date': d,
        'duration': durationMap[timeKey] ?? 0,
      });
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Last 30 Days', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            alignment: WrapAlignment.end,
            children: days.map((day) {
              return _buildDayBlock(day['duration']);
            }).toList(),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              const Text('Less', style: TextStyle(color: Colors.white54, fontSize: 10)),
              const SizedBox(width: 4),
              _buildDayBlock(0),
              const SizedBox(width: 4),
              _buildDayBlock(1800), // < 30m
              const SizedBox(width: 4),
              _buildDayBlock(5400), // < 120m
              const SizedBox(width: 4),
              _buildDayBlock(12000), // < 240m
              const SizedBox(width: 4),
              _buildDayBlock(20000), // >= 240m
              const SizedBox(width: 4),
              const Text('More', style: TextStyle(color: Colors.white54, fontSize: 10)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildDayBlock(int durationSeconds) {
    Color color;
    Border? border;
    List<BoxShadow>? shadow;

    if (durationSeconds == 0) {
      color = Colors.white.withOpacity(0.03);
      border = Border.all(color: Colors.white.withOpacity(0.05));
    } else {
      final minutes = durationSeconds / 60;
      if (minutes < 30) {
        color = const Color(0xFF10B981).withOpacity(0.2); // emerald-500/20
        border = Border.all(color: const Color(0xFF10B981).withOpacity(0.3));
      } else if (minutes < 120) {
        color = const Color(0xFF10B981).withOpacity(0.4);
        border = Border.all(color: const Color(0xFF10B981).withOpacity(0.5));
      } else if (minutes < 240) {
        color = const Color(0xFF10B981).withOpacity(0.7);
        border = Border.all(color: const Color(0xFF10B981).withOpacity(0.8));
      } else {
        color = const Color(0xFF10B981);
        border = Border.all(color: const Color(0xFF34D399)); // emerald-400
        shadow = [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.5), blurRadius: 10)];
      }
    }

    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        color: color,
        border: border,
        borderRadius: BorderRadius.circular(3),
        boxShadow: shadow,
      ),
    );
  }
}

extension ListExtension<T> on List<T> {
  void push(T element) => add(element);
}
