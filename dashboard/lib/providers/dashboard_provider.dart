/// Dashboard Provider — State management for the admin panel
/// Uses ChangeNotifier (Provider package) for reactive UI updates
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider extends ChangeNotifier {
  // ──── State ────
  bool isLoading = false;
  String? error;

  // Stats
  int totalUsers = 0;
  int totalGames = 0;
  int totalPuzzles = 0;
  int onlinePlayers = 0;

  // Data
  List<Map<String, dynamic>> leaderboard = [];
  List<Map<String, dynamic>> puzzles = [];
  List<Map<String, dynamic>> openings = [];

  // Health
  Map<String, dynamic> gatewayHealth = {};
  Map<String, dynamic> analytics = {};
  Map<String, dynamic> backendInfo = {};

  // AI Config
  int aiDepth = 15;
  double aiTimeLimit = 5.0;
  String aiDifficulty = 'medium';

  // ──── Load Dashboard Data ────
  Future<void> loadDashboardData() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      // Parallel data fetching for performance
      final results = await Future.wait([
        ApiService.getLeaderboard().catchError((_) => <Map<String, dynamic>>[]),
        ApiService.getPuzzles().catchError((_) => <Map<String, dynamic>>[]),
        ApiService.getOpenings().catchError((_) => <Map<String, dynamic>>[]),
        ApiService.getGatewayHealth().catchError((_) => <String, dynamic>{}),
        ApiService.getAnalytics().catchError((_) => <String, dynamic>{}),
        ApiService.getBackendHealth().catchError((_) => <String, dynamic>{}),
      ]);

      leaderboard = results[0] as List<Map<String, dynamic>>;
      puzzles = results[1] as List<Map<String, dynamic>>;
      openings = results[2] as List<Map<String, dynamic>>;
      gatewayHealth = results[3] as Map<String, dynamic>;
      analytics = results[4] as Map<String, dynamic>;
      backendInfo = results[5] as Map<String, dynamic>;

      totalUsers = leaderboard.length;
      totalPuzzles = puzzles.length;

      // Extract websocket stats
      final wsStats = analytics['websocket'] as Map<String, dynamic>?;
      onlinePlayers = wsStats?['onlinePlayers'] ?? 0;
    } catch (e) {
      error = e.toString();
    }

    isLoading = false;
    notifyListeners();
  }

  // ──── AI Configuration ────
  void updateAIDepth(int depth) {
    aiDepth = depth.clamp(1, 30);
    notifyListeners();
  }

  void updateAITimeLimit(double limit) {
    aiTimeLimit = limit.clamp(1.0, 30.0);
    notifyListeners();
  }

  void updateAIDifficulty(String difficulty) {
    aiDifficulty = difficulty;
    // Map difficulty to depth
    switch (difficulty) {
      case 'beginner':
        aiDepth = 3;
        break;
      case 'easy':
        aiDepth = 6;
        break;
      case 'medium':
        aiDepth = 10;
        break;
      case 'hard':
        aiDepth = 15;
        break;
      case 'master':
        aiDepth = 20;
        break;
    }
    notifyListeners();
  }

  // ──── Refresh ────
  Future<void> refresh() async {
    await loadDashboardData();
  }
}
