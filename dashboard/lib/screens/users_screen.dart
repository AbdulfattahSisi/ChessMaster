/// Users Screen — User management & statistics
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/dashboard_provider.dart';
import '../theme/app_theme.dart';

class UsersScreen extends StatelessWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<DashboardProvider>(
      builder: (context, provider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'User Management',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Monitor and manage platform users',
                style: TextStyle(color: Colors.white.withOpacity(0.5)),
              ),

              const SizedBox(height: 24),

              // Search bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Search users by username or email...',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                    border: InputBorder.none,
                    icon: Icon(Icons.search, color: Colors.white.withOpacity(0.3)),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // User stats row
              Row(
                children: [
                  _UserStatBox('Total Users', '${provider.totalUsers}', Icons.people, AppTheme.info),
                  const SizedBox(width: 16),
                  _UserStatBox('Online Now', '${provider.onlinePlayers}', Icons.circle, AppTheme.success),
                  const SizedBox(width: 16),
                  _UserStatBox('Avg ELO', _avgElo(provider.leaderboard), Icons.trending_up, AppTheme.gold),
                  const SizedBox(width: 16),
                  _UserStatBox('New Today', '0', Icons.person_add, AppTheme.primary),
                ],
              ),

              const SizedBox(height: 24),

              // Users table
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: provider.leaderboard.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(48),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.people_outline, size: 48, color: Colors.white.withOpacity(0.2)),
                              const SizedBox(height: 16),
                              Text(
                                'No users registered yet',
                                style: TextStyle(color: Colors.white.withOpacity(0.4)),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Users will appear here after signing up via the mobile app',
                                style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      )
                    : DataTable(
                        headingRowColor: WidgetStateProperty.all(Colors.white.withOpacity(0.03)),
                        columns: const [
                          DataColumn(label: Text('Username')),
                          DataColumn(label: Text('ELO Rating')),
                          DataColumn(label: Text('Games Played')),
                          DataColumn(label: Text('Wins')),
                          DataColumn(label: Text('Win Rate')),
                          DataColumn(label: Text('Actions')),
                        ],
                        rows: provider.leaderboard.map((user) {
                          final winRate = ((user['win_rate'] ?? 0) * 100).toStringAsFixed(1);
                          return DataRow(cells: [
                            DataCell(Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: AppTheme.primary.withOpacity(0.2),
                                  child: Text(
                                    (user['username'] ?? '?')[0].toUpperCase(),
                                    style: const TextStyle(color: AppTheme.primary, fontSize: 12),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(user['username'] ?? 'Unknown',
                                    style: const TextStyle(color: Colors.white)),
                              ],
                            )),
                            DataCell(Text(
                              '${user['elo_rating'] ?? 1200}',
                              style: const TextStyle(color: AppTheme.gold, fontWeight: FontWeight.w700),
                            )),
                            DataCell(Text('${user['total_games'] ?? 0}',
                                style: TextStyle(color: Colors.white.withOpacity(0.7)))),
                            DataCell(Text('${user['wins'] ?? 0}',
                                style: const TextStyle(color: AppTheme.success))),
                            DataCell(Text('$winRate%',
                                style: TextStyle(
                                  color: double.parse(winRate) >= 50
                                      ? AppTheme.success
                                      : AppTheme.error,
                                ))),
                            DataCell(IconButton(
                              icon: const Icon(Icons.more_vert, size: 18),
                              color: Colors.white.withOpacity(0.4),
                              onPressed: () {},
                            )),
                          ]);
                        }).toList(),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _avgElo(List<Map<String, dynamic>> users) {
    if (users.isEmpty) return '1200';
    final total = users.fold<int>(0, (sum, u) => sum + ((u['elo_rating'] ?? 1200) as int));
    return '${(total / users.length).round()}';
  }
}

class _UserStatBox extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _UserStatBox(this.title, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 8),
            Text(value,
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
            Text(title, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
