/// ♛ ChessMaster Admin Dashboard
/// Flutter / Dart — Web-based admin panel for monitoring & management
///
/// Architecture:
///   Dashboard (Flutter Web :8080) ──► FastAPI Backend (:8000)
///                                 ──► Express Gateway (:3000)
///
/// Features:
///   • Real-time player & game statistics
///   • User management (list, search, ban)
///   • Game analytics with charts (fl_chart)
///   • Puzzle management
///   • System health monitoring
///   • AI engine configuration

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'services/api_service.dart';
import 'providers/dashboard_provider.dart';
import 'screens/dashboard_screen.dart';
import 'screens/users_screen.dart';
import 'screens/games_screen.dart';
import 'screens/puzzles_screen.dart';
import 'screens/ai_config_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const ChessMasterDashboard());
}

class ChessMasterDashboard extends StatelessWidget {
  const ChessMasterDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: MaterialApp(
        title: 'ChessMaster Admin',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const MainLayout(),
      ),
    );
  }
}

/// Main layout with navigation rail + content area
class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  final List<NavigationItem> _navItems = [
    NavigationItem(icon: Icons.dashboard_rounded, label: 'Dashboard'),
    NavigationItem(icon: Icons.people_rounded, label: 'Users'),
    NavigationItem(icon: Icons.sports_esports_rounded, label: 'Games'),
    NavigationItem(icon: Icons.extension_rounded, label: 'Puzzles'),
    NavigationItem(icon: Icons.psychology_rounded, label: 'AI Engine'),
  ];

  final List<Widget> _screens = [
    const DashboardScreen(),
    const UsersScreen(),
    const GamesScreen(),
    const PuzzlesScreen(),
    const AIConfigScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Load initial data
    Future.microtask(() {
      context.read<DashboardProvider>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // ──── Side Navigation ────
          Container(
            width: 240,
            decoration: BoxDecoration(
              color: const Color(0xFF0D1117),
              border: Border(
                right: BorderSide(
                  color: Colors.white.withOpacity(0.06),
                ),
              ),
            ),
            child: Column(
              children: [
                // Logo header
                Container(
                  height: 80,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      const Text('♛', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Text(
                        'ChessMaster',
                        style: GoogleFonts.spaceGrotesk(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF6B35).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.admin_panel_settings,
                            size: 14, color: const Color(0xFFFF6B35)),
                        const SizedBox(width: 6),
                        Text(
                          'ADMIN PANEL',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFFFF6B35),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Nav items
                ...List.generate(_navItems.length, (index) {
                  final item = _navItems[index];
                  final isSelected = _selectedIndex == index;
                  return _buildNavItem(item, isSelected, () {
                    setState(() => _selectedIndex = index);
                  });
                }),

                const Spacer(),

                // System info footer
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Stack: Flutter / Dart',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.4),
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Backend: FastAPI',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.4),
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Gateway: Express.js',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.4),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ──── Main Content ────
          Expanded(
            child: Container(
              color: const Color(0xFF0A0A0A),
              child: _screens[_selectedIndex],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(NavigationItem item, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: isSelected
                  ? const Color(0xFFFF6B35).withOpacity(0.15)
                  : Colors.transparent,
              border: isSelected
                  ? Border.all(color: const Color(0xFFFF6B35).withOpacity(0.3))
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  item.icon,
                  size: 20,
                  color: isSelected
                      ? const Color(0xFFFF6B35)
                      : Colors.white.withOpacity(0.5),
                ),
                const SizedBox(width: 12),
                Text(
                  item.label,
                  style: GoogleFonts.inter(
                    color: isSelected
                        ? Colors.white
                        : Colors.white.withOpacity(0.5),
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final String label;
  NavigationItem({required this.icon, required this.label});
}
