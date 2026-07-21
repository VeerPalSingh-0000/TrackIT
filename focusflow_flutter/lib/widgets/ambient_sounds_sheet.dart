import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/audio_provider.dart';

class AmbientSoundsSheet extends StatelessWidget {
  final List<Map<String, dynamic>> sounds = [
    {'id': 'rain', 'label': 'Rain', 'icon': Icons.water_drop},
    {'id': 'forest', 'label': 'Forest', 'icon': Icons.park},
    {'id': 'cafe', 'label': 'Cafe', 'icon': Icons.local_cafe},
    {'id': 'lofi', 'label': 'Lofi Beats', 'icon': Icons.headphones},
  ];

  @override
  Widget build(BuildContext context) {
    final audioProvider = Provider.of<AudioProvider>(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisSize: CrossAxisSize.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Ambient Sounds', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              )
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: sounds.length,
              itemBuilder: (context, index) {
                final sound = sounds[index];
                final id = sound['id'];
                final isActive = audioProvider.isPlaying(id);
                final volume = audioProvider.getVolume(id);

                return Card(
                  color: Colors.white.withOpacity(0.05),
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(sound['icon'], color: isActive ? Colors.greenAccent : Colors.white54),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(sound['label'], style: TextStyle(color: isActive ? Colors.white : Colors.white70, fontWeight: FontWeight.bold)),
                            ),
                            Switch(
                              value: isActive,
                              activeColor: Colors.greenAccent,
                              onChanged: (_) => audioProvider.toggleSound(id),
                            )
                          ],
                        ),
                        if (isActive)
                          Slider(
                            value: volume,
                            min: 0.0,
                            max: 1.0,
                            activeColor: Colors.greenAccent,
                            inactiveColor: Colors.white12,
                            onChanged: (val) => audioProvider.setVolume(id, val),
                          )
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
