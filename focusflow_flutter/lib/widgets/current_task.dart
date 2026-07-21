import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class CurrentTask extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);
    final selectedProject = projectProvider.selectedProject;
    
    return GestureDetector(
      onTap: () {
        // TODO: Open TaskSelectionSheet
      },
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        elevated: false,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.folder_outlined, color: AppTheme.emerald400, size: 20),
            const SizedBox(width: 8),
            Text(
              selectedProject?.name ?? 'Select a Task',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 15,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.keyboard_arrow_down, color: AppTheme.slate500, size: 20),
          ],
        ),
      ),
    );
  }
}

