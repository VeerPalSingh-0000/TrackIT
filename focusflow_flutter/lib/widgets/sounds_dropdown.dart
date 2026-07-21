import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/audio_provider.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class SoundsDropdown extends StatefulWidget {
  @override
  _SoundsDropdownState createState() => _SoundsDropdownState();
}

class _SoundsDropdownState extends State<SoundsDropdown> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  void _toggleDropdown() {
    if (_isOpen) {
      _closeDropdown();
    } else {
      _showDropdown();
    }
  }

  void _closeDropdown() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    setState(() => _isOpen = false);
  }

  void _showDropdown() {
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    final audioProvider = Provider.of<AudioProvider>(context, listen: false);
    
    // We get a snapshot of the sounds to build the list
    final sounds = [
      {'id': 'rain', 'label': 'Rainfall', 'icon': Icons.water_drop},
      {'id': 'forest', 'label': 'Deep Forest', 'icon': Icons.park},
      {'id': 'cafe', 'label': 'Cozy Cafe', 'icon': Icons.local_cafe},
      {'id': 'lofi', 'label': 'Lofi Beats', 'icon': Icons.music_note},
    ];

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // Invisible background to close dropdown when tapped outside
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _closeDropdown,
                child: Container(color: Colors.transparent),
              ),
            ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: Offset(size.width - 320, size.height + 8),
              child: Material(
                color: Colors.transparent,
                child: Container(
                  width: 320,
                  constraints: const BoxConstraints(maxHeight: 400),
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    elevated: true,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.headphones, color: AppTheme.slate400, size: 16),
                            const SizedBox(width: 8),
                            const Text('Focus Sounds', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                            const Spacer(),
                            Row(
                              children: [
                                _dot(AppTheme.slate500),
                                const SizedBox(width: 4),
                                _dot(AppTheme.slate600),
                                const SizedBox(width: 4),
                                _dot(AppTheme.slate700),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Flexible(
                          child: ListView.separated(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: sounds.length,
                            separatorBuilder: (c, i) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final sound = sounds[index];
                              return _SoundControlItem(
                                id: sound['id'] as String,
                                label: sound['label'] as String,
                                icon: sound['icon'] as IconData,
                                provider: audioProvider,
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Center(
                          child: Text(
                            'MIX AND MATCH FOR DEEP WORK',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.slate500,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  Widget _dot(Color color) {
    return Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: color));
  }

  @override
  void dispose() {
    _overlayEntry?.remove();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(
        onTap: _toggleDropdown,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: _isOpen ? AppTheme.slate800 : AppTheme.slate900,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: _isOpen ? AppTheme.slate700 : AppTheme.slate800,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.music_note,
                color: _isOpen ? AppTheme.slate400 : AppTheme.slate500,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Sounds',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: _isOpen ? Colors.white : AppTheme.slate400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SoundControlItem extends StatelessWidget {
  final String id;
  final String label;
  final IconData icon;
  final AudioProvider provider;

  const _SoundControlItem({
    required this.id,
    required this.label,
    required this.icon,
    required this.provider,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: provider,
      builder: (context, _) {
        final isActive = provider.isPlaying(id);
        final volume = provider.getVolume(id);

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isActive ? AppTheme.slate900.withOpacity(0.9) : AppTheme.slate950.withOpacity(0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isActive ? AppTheme.emerald500.withOpacity(0.3) : AppTheme.slate800.withOpacity(0.8),
            ),
            boxShadow: isActive ? [
              BoxShadow(
                color: AppTheme.emerald500.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(0, 4),
              )
            ] : [],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isActive ? AppTheme.emerald500.withOpacity(0.2) : Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive ? AppTheme.emerald500.withOpacity(0.3) : Colors.white.withOpacity(0.05),
                      ),
                    ),
                    child: Icon(
                      icon,
                      color: isActive ? AppTheme.emerald400 : AppTheme.slate500,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: TextStyle(
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                      color: isActive ? Colors.white : AppTheme.slate400,
                      fontSize: 14,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => provider.toggleSound(id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? AppTheme.emerald500.withOpacity(0.2) : Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isActive ? AppTheme.emerald500.withOpacity(0.3) : Colors.white.withOpacity(0.06),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isActive ? Icons.volume_up : Icons.volume_off,
                            color: isActive ? AppTheme.emerald400 : AppTheme.slate500,
                            size: 12,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            isActive ? 'ON' : 'OFF',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isActive ? AppTheme.emerald400 : AppTheme.slate500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              if (isActive) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 4,
                          activeTrackColor: AppTheme.emerald500,
                          inactiveTrackColor: Colors.white.withOpacity(0.1),
                          thumbColor: Colors.white,
                          overlayColor: AppTheme.emerald500.withOpacity(0.2),
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                        ),
                        child: Slider(
                          value: volume,
                          onChanged: (val) => provider.setVolume(id, val),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 36,
                      child: Text(
                        '${(volume * 100).round()}%',
                        textAlign: TextAlign.right,
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono', // Or monospace
                          fontWeight: FontWeight.w500,
                          color: AppTheme.emerald400,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      }
    );
  }
}
