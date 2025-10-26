import 'dart:async';

import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/normative_entry.dart';

class NormativeService {
  Database? _db;

  Future<void> ensureSeeded() async {
    if (_db != null) {
      return;
    }
    final String dbPath = join(await getDatabasesPath(), 'normative_index.db');
    _db = await openDatabase(
      dbPath,
      version: 1,
      onCreate: (Database db, int version) async {
        await db.execute('''
          CREATE TABLE norms(
            code TEXT PRIMARY KEY,
            title TEXT,
            unit TEXT,
            section TEXT,
            default_quantity REAL,
            explanation TEXT
          );
        ''');
        final String seed =
            await rootBundle.loadString('assets/seeds/normative-index.json');
        final List<NormativeEntry> entries = NormativeEntry.decodeList(seed);
        final Batch batch = db.batch();
        for (final NormativeEntry entry in entries) {
          batch.insert('norms', <String, Object?>{
            'code': entry.code,
            'title': entry.title,
            'unit': entry.unit,
            'section': entry.section,
            'default_quantity': entry.defaultQuantity,
            'explanation': entry.explanation,
          });
        }
        await batch.commit(noResult: true);
      },
    );
  }

  Future<List<NormativeEntry>> search(String query) async {
    final Database db = _requireDb();
    final List<Map<String, Object?>> rows = await db.query(
      'norms',
      where: 'title LIKE ? OR code LIKE ?',
      whereArgs: <Object>['%$query%', '%$query%'],
      limit: 20,
    );
    return rows
        .map(
          (Map<String, Object?> row) => NormativeEntry(
            code: row['code'] as String,
            title: row['title'] as String,
            unit: row['unit'] as String,
            section: row['section'] as String,
            defaultQuantity: (row['default_quantity'] as num).toDouble(),
            explanation: row['explanation'] as String,
          ),
        )
        .toList();
  }

  Future<NormativeEntry?> findByCode(String code) async {
    final Database db = _requireDb();
    final List<Map<String, Object?>> rows = await db.query(
      'norms',
      where: 'code = ?',
      whereArgs: <Object>[code],
      limit: 1,
    );
    if (rows.isEmpty) {
      return null;
    }
    final Map<String, Object?> row = rows.first;
    return NormativeEntry(
      code: row['code'] as String,
      title: row['title'] as String,
      unit: row['unit'] as String,
      section: row['section'] as String,
      defaultQuantity: (row['default_quantity'] as num).toDouble(),
      explanation: row['explanation'] as String,
    );
  }

  Database _requireDb() {
    final Database? db = _db;
    if (db == null) {
      throw StateError('NormativeService is not initialized');
    }
    return db;
  }
}
