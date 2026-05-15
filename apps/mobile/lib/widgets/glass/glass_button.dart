import 'package:flutter/material.dart';

class GlassButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final Color? foregroundColor;
  final Color? borderColor;
  final double fontSize;
  final FontWeight? fontWeight;
  final bool isLoading;
  final double? width;
  final double? height;
  final Widget? child;

  const GlassButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.borderRadius = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
    this.color,
    this.foregroundColor,
    this.borderColor,
    this.fontSize = 16,
    this.fontWeight,
    this.isLoading = false,
    this.width,
    this.height,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color fg = foregroundColor ?? (isDark ? Colors.white : Colors.black87);
    final Color bg = color ?? (isDark ? const Color(0xFF2A2A33) : const Color(0xFFE8E8EE));
    final Color border = borderColor ?? (isDark ? const Color(0xFF3A3A43) : const Color(0xFFD0D0D5));

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: width,
        height: height,
        padding: padding,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: border, width: 1),
        ),
        child: child ??
            Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: fg, strokeWidth: 2),
                  )
                else ...[
                  if (icon != null) ...[
                    Icon(icon, color: fg, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    label,
                    style: TextStyle(color: fg, fontSize: fontSize, fontWeight: fontWeight ?? FontWeight.w600),
                  ),
                ],
              ],
            ),
      ),
    );
  }
}
