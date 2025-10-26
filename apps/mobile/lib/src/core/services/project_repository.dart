import 'dart:async';

import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/normative_entry.dart';
import '../models/project.dart';
import 'normative_service.dart';

class ProjectRepository {
  ProjectRepository(this._normativeService);

  final NormativeService _normativeService;
  Database? _db;

  Future<void> ensureInitialized() async {
    if (_db != null) {
      return;
    }
    final String dbPath = join(await getDatabasesPath(), 'smeta_offline.db');
    _db = await openDatabase(
      dbPath,
      version: 1,
      onCreate: (Database db, int version) async {
        await db.execute('''
          CREATE TABLE projects(
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at TEXT,
            method TEXT,
            region TEXT,
            index_profile TEXT,
            notes TEXT
          );
        ''');
        await db.execute('''
          CREATE TABLE project_norms(
            project_id TEXT,
            code TEXT,
            quantity REAL,
            coefficients TEXT,
            PRIMARY KEY(project_id, code)
          );
        ''');
      },
    );
    await _normativeService.ensureSeeded();
  }

  Future<List<ProjectDraft>> listProjects() async {
    final Database db = _requireDb();
    final List<Map<String, Object?>> rows =
        await db.query('projects', orderBy: 'created_at DESC');
    return Future.wait(rows.map(_mapProject));
  }

  Future<ProjectDraft> upsert(ProjectDraft draft) async {
    final Database db = _requireDb();
    await db.insert(
      'projects',
      <String, Object?>{
        'id': draft.id,
        'title': draft.title,
        'created_at': draft.createdAt.toIso8601String(),
        'method': draft.method.name,
        'region': draft.region,
        'index_profile': draft.indexProfile,
        'notes': draft.notes,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    await db.delete('project_norms', where: 'project_id = ?', whereArgs: <Object>[draft.id]);
    for (final SelectedEntry entry in draft.entries) {
      await db.insert(
        'project_norms',
        <String, Object?>{
          'project_id': draft.id,
          'code': entry.entry.code,
          'quantity': entry.quantity,
          'coefficients': entry.coefficients.entries
              .map((MapEntry<String, double> e) => '${e.key}:${e.value}')
              .join('|'),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    return draft;
  }

  Future<ProjectDraft?> findById(String id) async {
    final Database db = _requireDb();
    final List<Map<String, Object?>> rows =
        await db.query('projects', where: 'id = ?', whereArgs: <Object>[id], limit: 1);
    if (rows.isEmpty) {
      return null;
    }
    return _mapProject(rows.first);
  }

  Future<void> delete(String id) async {
    final Database db = _requireDb();
    await db.delete('project_norms', where: 'project_id = ?', whereArgs: <Object>[id]);
    await db.delete('projects', where: 'id = ?', whereArgs: <Object>[id]);
  }

  Future<ProjectDraft> _mapProject(Map<String, Object?> row) async {
    final NormativeService normative = _normativeService;
    final List<Map<String, Object?>> normRows = await _requireDb().query(
      'project_norms',
      where: 'project_id = ?',
      whereArgs: <Object>[row['id']],
    );
    final List<SelectedEntry> entries = <SelectedEntry>[];
    for (final Map<String, Object?> normRow in normRows) {
      final NormativeEntry? entry =
          await normative.findByCode(normRow['code'] as String);
      if (entry == null) {
        continue;
      }
      final Map<String, double> coefficients = <String, double>{};
      final String? serialized = normRow['coefficients'] as String?;
      if (serialized != null && serialized.isNotEmpty) {
        for (final String part in serialized.split('|')) {
          final List<String> kv = part.split(':');
          if (kv.length == 2) {
            coefficients[kv[0]] = double.tryParse(kv[1]) ?? 1;
          }
        }
      }
      entries.add(
        SelectedEntry(
          entry: entry,
          quantity: (normRow['quantity'] as num?)?.toDouble() ?? entry.defaultQuantity,
          coefficients: coefficients,
        ),
      );
    }
    return ProjectDraft(
      id: row['id'] as String,
      title: row['title'] as String,
      createdAt: DateTime.parse(row['created_at'] as String),
      method: CalculationMethod.values
          .firstWhere((CalculationMethod value) => value.name == row['method']),
      region: row['region'] as String,
      indexProfile: row['index_profile'] as String,
      entries: entries,
      notes: (row['notes'] as String?) ?? '',
    );
  }

  Database _requireDb() {
    final Database? db = _db;
    if (db == null) {
      throw StateError('ProjectRepository is not initialized');
    }
    return db;
  }
}
