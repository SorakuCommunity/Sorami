import 'package:flutter/material.dart';

class GlassContainer extends StatelessWidget {
  final Widget? child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadiusGeometry? borderRadius;
  final Color? color;
  final Color? borderColor;
  final Gradient? gradient;
  final List<BoxShadow>? boxShadow;
  final Alignment? alignment;
  final Clip clipBehavior;
  final VoidCallback? onTap;

  const GlassContainer({
    super.key,
    this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius,
    this.color,
    this.borderColor,
    this.gradient,
    this.boxShadow,
    this.alignment,
    this.clipBehavior = Clip.none,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bg = color ?? (isDark ? const Color(0xFF1C1C24) : const Color(0xFFF5F5FA));
    final Color border = borderColor ?? (isDark ? const Color(0xFF2A2A33) : const Color(0xFFE5E5EA));

    final Widget container = Container(
      width: width,
      height: height,
      margin: margin,
      clipBehavior: clipBehavior,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: borderRadius ?? BorderRadius.circular(16),
        border: Border.all(color: border, width: 1),
        gradient: gradient,
        boxShadow: boxShadow ?? [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: padding != null || alignment != null
          ? Container(padding: padding, alignment: alignment, child: child)
          : child,
    );

    if (onTap != null) {
      return Material(color: Colors.transparent, child: InkWell(onTap: onTap, child: container));
    }
    return container;
  }
}
