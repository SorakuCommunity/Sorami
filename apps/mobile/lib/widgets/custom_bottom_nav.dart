import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/ask_ai/ask_ai_screen.dart';
import '../features/category/category_screen.dart';
import '../features/clips/clips_screen.dart';
import '../features/home/home_screen.dart';
import '../features/profile/profile_screen.dart';

/// Enum untuk navigasi bottom tab
enum BottomNavTab {
  home,
  askAi,
  category,
  clips,
  profile,
}

/// Widget navigasi bawah dengan 5 tab utama
///
/// Menampilkan navigasi bottom bar yang memungkinkan pengguna
/// berpindah antar halaman utama aplikasi dengan mudah.
class CustomBottomNav extends ConsumerStatefulWidget {
  /// Constructor untuk [CustomBottomNav]
  const CustomBottomNav({super.key});

  @override
  ConsumerState<CustomBottomNav> createState() => _CustomBottomNavState();
}

class _CustomBottomNavState extends ConsumerState<CustomBottomNav> {
  /// Index tab yang saat ini dipilih
  int _selectedIndex = 0;

  /// Daftar halaman untuk setiap tab navigasi
  static const List<Widget> _pages = <Widget>[
    HomeScreen(),
    AskAIScreen(),
    CategoryScreen(),
    ClipsScreen(),
    ProfileScreen(),
  ];

  /// Daftar konfigurasi item bottom navigation
  static const List<BottomNavigationBarItem> _navigationItems =
      <BottomNavigationBarItem>[
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: 'Home',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.question_answer),
      label: 'Ask AI',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.list_alt),
      label: 'Category',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.movie),
      label: 'Clips',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Profile',
    ),
  ];

  /// Callback ketika item navigasi bawah diklik
  void _handleNavigation(int index) {
    if (_selectedIndex != index) {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: _navigationItems,
        currentIndex: _selectedIndex,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: _handleNavigation,
      ),
    );
  }
}
