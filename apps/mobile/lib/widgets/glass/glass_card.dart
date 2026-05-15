import 'package:flutter/material.dart';

class GlassCard extends StatelessWidget {
  final Widget? child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadiusGeometry? borderRadius;
  final Color? color;
  final Color? borderColor;
  final Gradient? gradient;
  final VoidCallback? onTap;
  final List<BoxShadow>? boxShadow;

  const GlassCard({
    super.key,
    this.child,
    this.width,
    this.height,
    this.padding = const EdgeInsets.all(16),
    this.margin,
    this.borderRadius,
    this.color,
    this.borderColor,
    this.gradient,
    this.onTap,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bg = color ?? (isDark ? const Color(0xFF1C1C24) : const Color(0xFFF5F5FA));
    final Color border = borderColor ?? (isDark ? const Color(0xFF2A2A33) : const Color(0xFFE5E5EA));

    final Widget card = Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: borderRadius ?? BorderRadius.circular(16),
        border: Border.all(color: border, width: 1),
        gradient: gradient,
        boxShadow: boxShadow ?? [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(padding: padding!, child: child),
    );

    if (onTap != null) {
      return Material(color: Colors.transparent, child: InkWell(onTap: onTap, child: card));
    }
    return card;
  }
}
