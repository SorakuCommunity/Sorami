import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class FloatingNavbar extends StatelessWidget {
  final double opacity;

  const FloatingNavbar({
    super.key,
    this.opacity = 0,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Container(
      padding: EdgeInsets.only(top: topPadding + 4),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AppTheme.glassBlur * opacity.clamp(0.3, 1.0),
            sigmaY: AppTheme.glassBlur * opacity.clamp(0.3, 1.0),
          ),
          child: Container(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 4,
              bottom: 8,
            ),
            decoration: BoxDecoration(
              color: AppTheme.background
                  .withValues(alpha: 0.6 * opacity.clamp(0.4, 1.0)),
              border: Border(
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: 0.05 * opacity),
                ),
              ),
            ),
            child: Center(
              child: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'S',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primary,
                        letterSpacing: -0.5,
                        shadows: [
                          Shadow(
                            color: AppTheme.primary.withValues(alpha: 0.3),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                    ),
                    TextSpan(
                      text: 'orami',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
