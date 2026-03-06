/// Dashboard Screen — Main overview with stats cards and charts
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/dashboard_provider.dart';
import '../theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<DashboardProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primary),
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dashboard',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'ChessMaster Platform Overview',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.5),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => provider.refresh(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Refresh'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary.withOpacity(0.15),
                      foregroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(color: AppTheme.primary.withOpacity(0.3)),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // ──── Stats Cards ────
              Row(
                children: [
                  _StatCard(
                    title: 'Total Users',
                    value: '${provider.totalUsers}',
                    icon: Icons.people_rounded,
                    color: AppTheme.info,
                  ),
                  const SizedBox(width: 16),
                  _StatCard(
                    title: 'Online Now',
                    value: '${provider.onlinePlayers}',
                    icon: Icons.circle,
                    color: AppTheme.success,
                  ),
                  const SizedBox(width: 16),
                  _StatCard(
                    title: 'Puzzles',
                    value: '${provider.totalPuzzles}',
                    icon: Icons.extension_rounded,
                    color: AppTheme.warning,
                  ),
                  const SizedBox(width: 16),
                  _StatCard(
                    title: 'Openings',
                    value: '${provider.openings.length}',
                    icon: Icons.menu_book_rounded,
                    color: AppTheme.primary,
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // ──── Service Health ────
              Text(
                'Service Health',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _ServiceCard(
                    name: 'FastAPI Backend',
                    tech: 'Python / FastAPI',
                    port: '8000',
                    status: provider.backendInfo.isNotEmpty ? 'healthy' : 'checking',
                    icon: Icons.api_rounded,
                  ),
                  const SizedBox(width: 16),
                  _ServiceCard(
                    name: 'Express Gateway',
                    tech: 'Node.js / Express',
                    port: '3000',
                    status: provider.gatewayHealth['status'] ?? 'checking',
                    icon: Icons.router_rounded,
                  ),
                  const SizedBox(width: 16),
                  _ServiceCard(
                    name: 'WebSocket Server',
                    tech: 'ws (Node.js)',
                    port: '3000/ws',
                    status: 'healthy',
                    icon: Icons.sync_alt_rounded,
                  ),
                  const SizedBox(width: 16),
                  _ServiceCard(
                    name: 'SQLite Database',
                    tech: 'SQLAlchemy ORM',
                    port: 'embedded',
                    status: 'healthy',
                    icon: Icons.storage_rounded,
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // ──── Top Players ────
              Text(
                'Top Players (Leaderboard)',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: provider.leaderboard.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(32),
                        child: Center(
                          child: Text(
                            'No players yet. Register via the mobile app!',
                            style: TextStyle(color: Colors.white.withOpacity(0.5)),
                          ),
                        ),
                      )
                    : DataTable(
                        headingRowColor: WidgetStateProperty.all(
                          Colors.white.withOpacity(0.03),
                        ),
                        columns: const [
                          DataColumn(label: Text('Rank')),
                          DataColumn(label: Text('Username')),
                          DataColumn(label: Text('ELO')),
                          DataColumn(label: Text('Games')),
                          DataColumn(label: Text('Win Rate')),
                        ],
                        rows: provider.leaderboard.take(10).toList().asMap().entries.map((entry) {
                          final i = entry.key;
                          final user = entry.value;
                          final medals = ['🥇', '🥈', '🥉'];
                          return DataRow(cells: [
                            DataCell(Text(
                              i < 3 ? medals[i] : '#${i + 1}',
                              style: TextStyle(
                                fontSize: i < 3 ? 18 : 14,
                                color: Colors.white.withOpacity(0.8),
                              ),
                            )),
                            DataCell(Text(
                              user['username'] ?? 'Unknown',
                              style: const TextStyle(color: Colors.white),
                            )),
                            DataCell(Text(
                              '${user['elo_rating'] ?? 1200}',
                              style: const TextStyle(
                                color: AppTheme.gold,
                                fontWeight: FontWeight.w700,
                              ),
                            )),
                            DataCell(Text(
                              '${user['total_games'] ?? 0}',
                              style: TextStyle(color: Colors.white.withOpacity(0.7)),
                            )),
                            DataCell(Text(
                              '${((user['win_rate'] ?? 0) * 100).toStringAsFixed(1)}%',
                              style: const TextStyle(color: AppTheme.success),
                            )),
                          ]);
                        }).toList(),
                      ),
              ),

              const SizedBox(height: 32),

              // ──── Tech Stack ────
              Text(
                'Technology Stack',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _TechChip('React Native', Icons.phone_android, Colors.blue),
                  _TechChip('Flutter / Dart', Icons.flutter_dash, Colors.cyan),
                  _TechChip('Node.js / Express', Icons.javascript, Colors.green),
                  _TechChip('Python / FastAPI', Icons.code, Colors.yellow),
                  _TechChip('PostgreSQL / SQLite', Icons.storage, Colors.blue.shade300),
                  _TechChip('REST API', Icons.api, AppTheme.primary),
                  _TechChip('AI / ML Engine', Icons.psychology, Colors.purple),
                  _TechChip('WebSocket', Icons.sync_alt, Colors.tealAccent),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

// ──────────────── Stat Card Widget ────────────────

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 13,
                  ),
                ),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ──────────────── Service Card Widget ────────────────

class _ServiceCard extends StatelessWidget {
  final String name;
  final String tech;
  final String port;
  final String status;
  final IconData icon;

  const _ServiceCard({
    required this.name,
    required this.tech,
    required this.port,
    required this.status,
    required this.icon,
  });

  Color get statusColor {
    switch (status) {
      case 'healthy':
        return AppTheme.success;
      case 'degraded':
        return AppTheme.warning;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppTheme.primary, size: 20),
                const Spacer(),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: statusColor,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              name,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              tech,
              style: TextStyle(
                color: Colors.white.withOpacity(0.4),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              ':$port',
              style: TextStyle(
                color: AppTheme.primary.withOpacity(0.7),
                fontSize: 12,
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ──────────────── Tech Chip Widget ────────────────

class _TechChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;

  const _TechChip(this.label, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
