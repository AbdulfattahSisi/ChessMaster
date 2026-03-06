/// Games Screen — Game analytics and history
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/dashboard_provider.dart';
import '../theme/app_theme.dart';

class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<DashboardProvider>(
      builder: (context, provider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Game Analytics',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Track game statistics and AI performance',
                style: TextStyle(color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(height: 32),

              // Game type distribution
              Row(
                children: [
                  _GameTypeCard('vs AI', 'Human vs Computer', Icons.psychology, Colors.purple, '85%'),
                  const SizedBox(width: 16),
                  _GameTypeCard('PvP', 'Human vs Human', Icons.people, AppTheme.info, '15%'),
                  const SizedBox(width: 16),
                  _GameTypeCard('Analysis', 'Position Review', Icons.analytics, AppTheme.gold, '—'),
                  const SizedBox(width: 16),
                  _GameTypeCard('Puzzles', 'Tactical Training', Icons.extension, AppTheme.success, '${provider.totalPuzzles}'),
                ],
              ),

              const SizedBox(height: 32),

              // AI Difficulty breakdown
              Text(
                'AI Difficulty Distribution',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  children: [
                    _DifficultyBar('Beginner', 0.3, Colors.green, 'Depth 3'),
                    const SizedBox(height: 12),
                    _DifficultyBar('Easy', 0.5, Colors.lightGreen, 'Depth 6'),
                    const SizedBox(height: 12),
                    _DifficultyBar('Medium', 0.8, AppTheme.gold, 'Depth 10'),
                    const SizedBox(height: 12),
                    _DifficultyBar('Hard', 0.4, Colors.orange, 'Depth 15'),
                    const SizedBox(height: 12),
                    _DifficultyBar('Master', 0.15, Colors.red, 'Depth 20'),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Openings popularity
              Text(
                'Popular Openings',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: provider.openings.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: Text('Loading openings...')),
                      )
                    : DataTable(
                        headingRowColor: WidgetStateProperty.all(Colors.white.withOpacity(0.03)),
                        columns: const [
                          DataColumn(label: Text('ECO')),
                          DataColumn(label: Text('Opening')),
                          DataColumn(label: Text('Category')),
                          DataColumn(label: Text('White Win')),
                          DataColumn(label: Text('Black Win')),
                          DataColumn(label: Text('Draw')),
                        ],
                        rows: provider.openings.map((o) {
                          return DataRow(cells: [
                            DataCell(Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.purple.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(o['eco_code'] ?? '',
                                  style: const TextStyle(color: Colors.purpleAccent, fontWeight: FontWeight.w700)),
                            )),
                            DataCell(Text(o['name'] ?? '', style: const TextStyle(color: Colors.white))),
                            DataCell(Text(o['category'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.5)))),
                            DataCell(Text('${((o['win_rate_white'] ?? 0) * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(color: Colors.white))),
                            DataCell(Text('${((o['win_rate_black'] ?? 0) * 100).toStringAsFixed(0)}%',
                                style: TextStyle(color: Colors.white.withOpacity(0.7)))),
                            DataCell(Text('${((o['draw_rate'] ?? 0) * 100).toStringAsFixed(0)}%',
                                style: TextStyle(color: Colors.white.withOpacity(0.5)))),
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
}

class _GameTypeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String stat;

  const _GameTypeCard(this.title, this.subtitle, this.icon, this.color, this.stat);

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
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(title, style: GoogleFonts.spaceGrotesk(
                fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
            const SizedBox(height: 8),
            Text(stat, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 20)),
          ],
        ),
      ),
    );
  }
}

class _DifficultyBar extends StatelessWidget {
  final String label;
  final double value;
  final Color color;
  final String depth;

  const _DifficultyBar(this.label, this.value, this.color, this.depth);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 80, child: Text(label, style: const TextStyle(color: Colors.white))),
        Expanded(
          child: Container(
            height: 24,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: value,
              child: Container(
                decoration: BoxDecoration(
                  color: color.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 60,
          child: Text(depth, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
        ),
      ],
    );
  }
}
