/// AI Configuration Screen — Manage the chess AI engine parameters
/// Demonstrates AI/ML integration knowledge
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/dashboard_provider.dart';
import '../theme/app_theme.dart';

class AIConfigScreen extends StatelessWidget {
  const AIConfigScreen({super.key});

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
                'AI Engine Configuration',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Configure the chess AI engine parameters and algorithms',
                style: TextStyle(color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(height: 32),

              // AI Architecture
              _SectionCard(
                title: 'Engine Architecture',
                icon: Icons.architecture,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _InfoRow('Algorithm', 'Minimax with Alpha-Beta Pruning'),
                    _InfoRow('Search', 'Iterative Deepening + Quiescence Search'),
                    _InfoRow('Evaluation', 'Piece-Square Tables + Material Count'),
                    _InfoRow('Move Ordering', 'MVV-LVA + Killer Heuristic'),
                    _InfoRow('Transposition', 'Zobrist Hashing (planned)'),
                    _InfoRow('Language', 'Python (python-chess library)'),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Difficulty levels
              _SectionCard(
                title: 'Difficulty Levels',
                icon: Icons.tune,
                child: Column(
                  children: [
                    _DifficultyLevel(
                      'Beginner', 'Depth 3', 'Random errors, no endgame tables',
                      Colors.green, provider.aiDifficulty == 'beginner',
                      () => provider.updateAIDifficulty('beginner'),
                    ),
                    _DifficultyLevel(
                      'Easy', 'Depth 6', 'Basic tactics, occasional blunders',
                      Colors.lightGreen, provider.aiDifficulty == 'easy',
                      () => provider.updateAIDifficulty('easy'),
                    ),
                    _DifficultyLevel(
                      'Medium', 'Depth 10', 'Solid play, tactical awareness',
                      AppTheme.gold, provider.aiDifficulty == 'medium',
                      () => provider.updateAIDifficulty('medium'),
                    ),
                    _DifficultyLevel(
                      'Hard', 'Depth 15', 'Strong calculation, strategic planning',
                      Colors.orange, provider.aiDifficulty == 'hard',
                      () => provider.updateAIDifficulty('hard'),
                    ),
                    _DifficultyLevel(
                      'Master', 'Depth 20', 'Full-strength engine, deep search',
                      Colors.red, provider.aiDifficulty == 'master',
                      () => provider.updateAIDifficulty('master'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Parameters
              _SectionCard(
                title: 'Engine Parameters',
                icon: Icons.settings,
                child: Column(
                  children: [
                    // Depth slider
                    Row(
                      children: [
                        SizedBox(
                          width: 120,
                          child: Text('Search Depth', style: TextStyle(color: Colors.white.withOpacity(0.7))),
                        ),
                        Expanded(
                          child: Slider(
                            value: provider.aiDepth.toDouble(),
                            min: 1,
                            max: 30,
                            divisions: 29,
                            activeColor: AppTheme.primary,
                            label: '${provider.aiDepth}',
                            onChanged: (v) => provider.updateAIDepth(v.round()),
                          ),
                        ),
                        SizedBox(
                          width: 40,
                          child: Text('${provider.aiDepth}',
                              style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Time limit slider
                    Row(
                      children: [
                        SizedBox(
                          width: 120,
                          child: Text('Time Limit (s)', style: TextStyle(color: Colors.white.withOpacity(0.7))),
                        ),
                        Expanded(
                          child: Slider(
                            value: provider.aiTimeLimit,
                            min: 1,
                            max: 30,
                            divisions: 29,
                            activeColor: AppTheme.gold,
                            label: '${provider.aiTimeLimit.toStringAsFixed(1)}s',
                            onChanged: (v) => provider.updateAITimeLimit(v),
                          ),
                        ),
                        SizedBox(
                          width: 40,
                          child: Text('${provider.aiTimeLimit.toStringAsFixed(0)}s',
                              style: const TextStyle(color: AppTheme.gold, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ML Features
              _SectionCard(
                title: 'Machine Learning Features',
                icon: Icons.psychology,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _MLFeature(
                      'Move Classification',
                      'Classifies moves as Brilliant, Great, Good, Inaccuracy, Mistake, or Blunder using evaluation deltas',
                      true,
                    ),
                    _MLFeature(
                      'Game Review Engine',
                      'Post-game analysis with accuracy percentage and annotated moves',
                      true,
                    ),
                    _MLFeature(
                      'Adaptive Difficulty',
                      'AI strength adjusts based on player ELO rating',
                      true,
                    ),
                    _MLFeature(
                      'Pattern Recognition',
                      'Identifies tactical patterns (forks, pins, skewers) in positions',
                      true,
                    ),
                    _MLFeature(
                      'Opening Book',
                      'ECO-coded opening database with win-rate statistics',
                      true,
                    ),
                    _MLFeature(
                      'Neural Network Eval',
                      'NNUE-style evaluation (planned for v3.0)',
                      false,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;

  const _SectionCard({required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
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
              Icon(icon, color: AppTheme.primary, size: 22),
              const SizedBox(width: 10),
              Text(title, style: GoogleFonts.spaceGrotesk(
                  fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          SizedBox(
            width: 160,
            child: Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5))),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class _DifficultyLevel extends StatelessWidget {
  final String name;
  final String depth;
  final String description;
  final Color color;
  final bool isActive;
  final VoidCallback onTap;

  const _DifficultyLevel(this.name, this.depth, this.description, this.color, this.isActive, this.onTap);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: isActive ? color.withOpacity(0.1) : Colors.transparent,
            border: isActive ? Border.all(color: color.withOpacity(0.4)) : null,
          ),
          child: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive ? color : Colors.transparent,
                  border: Border.all(color: color),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 80,
                child: Text(name, style: TextStyle(color: Colors.white, fontWeight: isActive ? FontWeight.w700 : FontWeight.w400)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(depth, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(description, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MLFeature extends StatelessWidget {
  final String title;
  final String description;
  final bool enabled;

  const _MLFeature(this.title, this.description, this.enabled);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            enabled ? Icons.check_circle : Icons.radio_button_unchecked,
            color: enabled ? AppTheme.success : Colors.white.withOpacity(0.3),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                      color: enabled ? Colors.white : Colors.white.withOpacity(0.4),
                      fontWeight: FontWeight.w600,
                    )),
                const SizedBox(height: 2),
                Text(description,
                    style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
