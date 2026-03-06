/// API Service — HTTP client for ChessMaster backend
/// Communicates with FastAPI (:8000) and Express Gateway (:3000)
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String backendUrl = 'http://localhost:8000';
  static const String gatewayUrl = 'http://localhost:3001';

  // ──── Backend Direct (FastAPI) ────

  /// Fetch all users with stats
  static Future<List<Map<String, dynamic>>> getLeaderboard() async {
    final response = await http.get(
      Uri.parse('$backendUrl/api/leaderboard'),
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    throw Exception('Failed to load leaderboard: ${response.statusCode}');
  }

  /// Fetch all puzzles
  static Future<List<Map<String, dynamic>>> getPuzzles() async {
    final response = await http.get(
      Uri.parse('$backendUrl/api/puzzles/'),
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    throw Exception('Failed to load puzzles: ${response.statusCode}');
  }

  /// Fetch all openings
  static Future<List<Map<String, dynamic>>> getOpenings() async {
    final response = await http.get(
      Uri.parse('$backendUrl/api/openings'),
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    throw Exception('Failed to load openings: ${response.statusCode}');
  }

  /// Fetch backend health
  static Future<Map<String, dynamic>> getBackendHealth() async {
    final response = await http.get(
      Uri.parse('$backendUrl/'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Backend unreachable');
  }

  // ──── Gateway (Express.js) ────

  /// Fetch gateway health (checks all services)
  static Future<Map<String, dynamic>> getGatewayHealth() async {
    try {
      final response = await http.get(
        Uri.parse('$gatewayUrl/health'),
      );
      if (response.statusCode == 200 || response.statusCode == 503) {
        return json.decode(response.body);
      }
      throw Exception('Gateway health check failed');
    } catch (e) {
      return {
        'status': 'offline',
        'services': {
          'gateway': {'status': 'unreachable'},
        },
      };
    }
  }

  /// Fetch gateway analytics
  static Future<Map<String, dynamic>> getAnalytics() async {
    try {
      final response = await http.get(
        Uri.parse('$gatewayUrl/analytics'),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      throw Exception('Analytics unavailable');
    } catch (e) {
      return {
        'gateway': {'uptime': 'N/A'},
        'requests': {'total': 0},
        'websocket': {'activeConnections': 0},
      };
    }
  }

  // ──── AI Analysis ────

  /// Analyze a chess position
  static Future<Map<String, dynamic>> analyzePosition(
    String fen, {
    int depth = 15,
  }) async {
    final response = await http.post(
      Uri.parse('$backendUrl/api/analysis/evaluate'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'fen': fen, 'depth': depth}),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Analysis failed: ${response.statusCode}');
  }
}
