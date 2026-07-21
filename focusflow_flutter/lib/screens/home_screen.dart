import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/timer_provider.dart';
import '../widgets/timer_display.dart';
import '../widgets/timer_controls.dart';
import '../widgets/timer_mode_toggle.dart';
import '../widgets/current_task.dart';
import '../widgets/animated_background.dart';
import '../widgets/sounds_dropdown.dart';
import '../screens/settings_screen.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final timerProvider = Provider.of<TimerProvider>(context);
    final isRunning = timerProvider.isRunning;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.slate950,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 28),
            const SizedBox(width: 8),
            const Text(
              'FocusFlow',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white, size: 28),
            onPressed: () {
              _scaffoldKey.currentState?.openEndDrawer();
            },
          ),
        ],
      ),
      endDrawer: _buildDrawer(context),
      body: AnimatedBackground(
        isRunning: isRunning,
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 10),
                  TimerModeToggle(),
                  const SizedBox(height: 32),
                  
                  TimerDisplay(),
                  
                  // Pomodoro Label
                  if (timerProvider.mode == TimerMode.pomodoro)
                    Padding(
                      padding: const EdgeInsets.only(top: 16.0),
                      child: Text(
                        'Focus Session',
                        style: TextStyle(
                          color: AppTheme.amber400,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    )
                  else
                    const SizedBox(height: 35),
                  
                  const SizedBox(height: 24),
                  CurrentTask(),
                  const SizedBox(height: 24),
                  TimerControls(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    return Drawer(
      backgroundColor: AppTheme.slate900,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              alignment: Alignment.centerLeft,
              child: const Text(
                'Menu',
                style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.music_note, color: AppTheme.slate400),
              title: const Text('Focus Sounds', style: TextStyle(color: AppTheme.slate300)),
              onTap: () {
                Navigator.pop(context); // close drawer
                showModalBottomSheet(
                  context: context,
                  backgroundColor: AppTheme.slate900,
                  isScrollControlled: true,
                  builder: (context) => Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                         const Text("Sounds", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                         const SizedBox(height: 16),
                         SizedBox(height: 300, child: SoundsDropdown()),
                      ]
                    )
                  )
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings, color: AppTheme.slate400),
              title: const Text('Settings', style: TextStyle(color: AppTheme.slate300)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => SettingsScreen()));
              },
            ),
            const Spacer(),
            const Divider(color: AppTheme.slate800),
            ListTile(
              leading: const Icon(Icons.logout, color: AppTheme.rose500),
              title: const Text('Sign out', style: TextStyle(color: AppTheme.rose500)),
              onTap: () async {
                await authProvider.signOut();
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
