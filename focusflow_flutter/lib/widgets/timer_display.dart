import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/timer_provider.dart';
import '../theme/app_theme.dart';
import 'dart:ui';

class TimerDisplay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final timerProvider = Provider.of<TimerProvider>(context);
    final isRunning = timerProvider.isRunning;
    final formattedTime = timerProvider.formattedTime;
    
    // Timer size constraints similar to CSS media queries
    final double timerSize = 260.0;
    
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background Glow
          AnimatedOpacity(
            opacity: isRunning ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 1000),
            child: Container(
              width: timerSize * 1.3,
              height: timerSize * 1.3,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.emerald500.withOpacity(0.2),
                    AppTheme.emerald600.withOpacity(0.1),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.4, 0.7],
                ),
              ),
            ),
          ),
          
          // Ring and Ticks (SVG equivalent)
          SizedBox(
            width: timerSize,
            height: timerSize,
            child: CustomPaint(
              painter: TimerRingPainter(isRunning: isRunning),
            ),
          ),
          
          // Center Glass Dial
          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeOutCubic,
            width: timerSize * 0.76,
            height: timerSize * 0.76,
            transform: Matrix4.identity()..scale(isRunning ? 1.04 : 1.0),
            transformAlignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                center: const Alignment(-0.4, -0.4),
                radius: 1.0,
                colors: [
                  Colors.white.withOpacity(0.08),
                  AppTheme.slate900.withOpacity(0.7),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.15),
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 40,
                  offset: const Offset(0, 10),
                ),
                if (isRunning)
                  BoxShadow(
                    color: AppTheme.emerald500.withOpacity(0.2),
                    blurRadius: 40,
                  ),
                if (isRunning)
                  BoxShadow(
                    color: AppTheme.emerald500.withOpacity(0.4),
                    blurRadius: 1,
                    spreadRadius: 1,
                  ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(timerSize / 2),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                child: Stack(
                  children: [
                    // Glass shine reflection on top half
                    Align(
                      alignment: Alignment.topCenter,
                      child: Container(
                        height: timerSize * 0.38,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.white.withOpacity(0.06),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Inner Content
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            isRunning ? 'FOCUSING' : 'READY',
                            style: GoogleFonts.shareTechMono(
                              color: isRunning ? AppTheme.emerald400 : AppTheme.emerald400.withOpacity(0.45),
                              fontSize: timerSize * 0.032,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formattedTime,
                            style: GoogleFonts.shareTechMono(
                              fontSize: timerSize * 0.17,
                              fontWeight: FontWeight.w400,
                              color: Colors.white,
                              letterSpacing: -0.5,
                              shadows: isRunning ? [
                                Shadow(
                                  color: AppTheme.emerald400.withOpacity(0.4),
                                  blurRadius: 20,
                                ),
                                Shadow(
                                  color: AppTheme.emerald500.withOpacity(0.18),
                                  blurRadius: 50,
                                ),
                              ] : [],
                            ),
                          ),
                          const SizedBox(height: 6),
                          AnimatedOpacity(
                            opacity: isRunning ? 1.0 : 0.0,
                            duration: const Duration(milliseconds: 500),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.easeOutCubic,
                              transform: Matrix4.identity()..translate(0.0, isRunning ? 0.0 : 4.0),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.emerald500.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppTheme.emerald500.withOpacity(0.3)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 5,
                                    height: 5,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppTheme.emerald400,
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppTheme.emerald400.withOpacity(0.8),
                                          blurRadius: 6,
                                        )
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    'ACTIVE',
                                    style: GoogleFonts.shareTechMono(
                                      color: AppTheme.emerald400,
                                      fontSize: timerSize * 0.03,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TimerRingPainter extends CustomPainter {
  final bool isRunning;

  TimerRingPainter({required this.isRunning});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    // Draw Progress Ring (like SVG stroke="rgba(255,255,255,0.05)")
    final ringPaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    canvas.drawCircle(center, radius - 10, ringPaint);

    // Draw Ticks
    final numTicks = 60;
    for (int i = 0; i < numTicks; i++) {
      final angle = (i * 2 * pi / numTicks) - pi / 2;
      final is5 = i % 5 == 0;
      
      final tickLength = is5 ? 8.0 : 4.0;
      final outerRadius = radius - 15;
      final innerRadius = outerRadius - tickLength;
      
      final p1 = Offset(center.dx + innerRadius * cos(angle), center.dy + innerRadius * sin(angle));
      final p2 = Offset(center.dx + outerRadius * cos(angle), center.dy + outerRadius * sin(angle));
      
      final tickPaint = Paint()
        ..color = is5 
            ? AppTheme.emerald400.withOpacity(0.35) 
            : Colors.white.withOpacity(0.08)
        ..strokeWidth = is5 ? 1.2 : 0.4
        ..style = PaintingStyle.stroke;
      
      canvas.drawLine(p1, p2, tickPaint);
    }
  }

  @override
  bool shouldRepaint(covariant TimerRingPainter oldDelegate) {
    return oldDelegate.isRunning != isRunning;
  }
}
