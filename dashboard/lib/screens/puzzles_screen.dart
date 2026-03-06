/// Puzzles Screen — Puzzle management and statistics
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/dashboard_provider.dart';
import '../theme/app_theme.dart';

class PuzzlesScreen extends StatelessWidget {
  const PuzzlesScreen({super.key});

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
                'Puzzle Management',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${provider.puzzles.length} puzzles in the database',
                style: TextStyle(color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(height: 24),

              // Category breakdown
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _getCategoryChips(provider.puzzles),
              ),

              const SizedBox(height: 24),

              // Puzzles table
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: DataTable(
                  headingRowColor: WidgetStateProperty.all(Colors.white.withOpacity(0.03)),
                  columns: const [
                    DataColumn(label: Text('Title')),
                    DataColumn(label: Text('Category')),
                    DataColumn(label: Text('Difficulty')),
                    DataColumn(label: Text('ELO')),
                    DataColumn(label: Text('Attempts')),
                    DataColumn(label: Text('Solve Rate')),
                  ],
                  rows: provider.puzzles.map((p) {
                    final attempts = p['times_attempted'] ?? 0;
                    final solved = p['times_solved'] ?? 0;
                    final solveRate = attempts > 0 ? (solved / attempts * 100) : 0;
                    final difficulty = p['difficulty'] ?? 1;

                    return DataRow(cells: [
                      DataCell(Text(p['title'] ?? '', style: const TextStyle(color: Colors.white))),
                      DataCell(_CategoryBadge(p['category'] ?? '')),
                      DataCell(Row(
                        children: List.generate(5, (i) => Icon(
                          i < difficulty ? Icons.star : Icons.star_border,
                          size: 14,
                          color: i < difficulty ? AppTheme.gold : Colors.white.withOpacity(0.2),
                        )),
                      )),
                      DataCell(Text('${p['elo_rating'] ?? 1200}',
                          style: const TextStyle(color: AppTheme.gold, fontWeight: FontWeight.w600))),
                      DataCell(Text('$attempts', style: TextStyle(color: Colors.white.withOpacity(0.7)))),
                      DataCell(Text('${solveRate.toStringAsFixed(1)}%',
                          style: TextStyle(
                            color: solveRate > 50 ? AppTheme.success : AppTheme.warning,
                          ))),
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

  List<Widget> _getCategoryChips(List<Map<String, dynamic>> puzzles) {
    final categories = <String, int>{};
    for (final p in puzzles) {
      final cat = p['category'] ?? 'other';
      categories[cat] = (categories[cat] ?? 0) + 1;
    }
    return categories.entries.map((e) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
        ),
        child: Text(
          '${e.key} (${e.value})',
          style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w600, fontSize: 13),
        ),
      );
    }).toList();
  }
}

class _CategoryBadge extends StatelessWidget {
  final String category;
  const _CategoryBadge(this.category);

  Color get color {
    switch (category) {
      case 'checkmate': return Colors.red;
      case 'fork': return Colors.orange;
      case 'pin': return Colors.blue;
      case 'skewer': return Colors.purple;
      case 'sacrifice': return Colors.pink;
      case 'endgame': return Colors.teal;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        category,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
