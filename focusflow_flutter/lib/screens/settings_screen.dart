import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/timer_provider.dart';
import '../theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final timerProvider = Provider.of<TimerProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Max Stopwatch Length', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          DropdownButtonFormField<int>(
            value: 4, // Replace with actual value from timerProvider if it's exposed
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: AppTheme.slate800,
            ),
            dropdownColor: AppTheme.slate800,
            items: const [
              DropdownMenuItem(value: 1, child: Text('1 Hour')),
              DropdownMenuItem(value: 2, child: Text('2 Hours')),
              DropdownMenuItem(value: 3, child: Text('3 Hours')),
              DropdownMenuItem(value: 4, child: Text('4 Hours')),
            ],
            onChanged: (val) {
              if (val != null) {
                timerProvider.setMaxSessionLength(val);
              }
            },
          ),
          const SizedBox(height: 48),
          ElevatedButton.icon(
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.rose500,
              foregroundColor: AppTheme.slate100,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).signOut();
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}

