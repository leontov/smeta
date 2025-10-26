import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/normative_entry.dart';
import '../models/project.dart';
import 'normative_service.dart';
import 'project_repository.dart';

class EstimationController extends ChangeNotifier {
  EstimationController(this._normativeService, this._repository);

  final NormativeService _normativeService;
  final ProjectRepository _repository;

  ProjectDraft? _draft;
  bool _isBusy = false;
  List<NormativeEntry> _candidates = <NormativeEntry>[];

  ProjectDraft? get draft => _draft;
  bool get isBusy => _isBusy;
  List<NormativeEntry> get candidates => _candidates;

  Future<void> initialize(String description) async {
    _isBusy = true;
    notifyListeners();
    await _repository.ensureInitialized();
    _draft = ProjectDraft.initial(description);
    _isBusy = false;
    notifyListeners();
  }

  Future<void> searchCandidates(String query) async {
    if (query.isEmpty) {
      _candidates = <NormativeEntry>[];
      notifyListeners();
      return;
    }
    _isBusy = true;
    notifyListeners();
    await _normativeService.ensureSeeded();
    _candidates = await _normativeService.search(query);
    _isBusy = false;
    notifyListeners();
  }

  Future<void> toggleEntry(NormativeEntry entry) async {
    if (_draft == null) {
      return;
    }
    final List<SelectedEntry> entries = List<SelectedEntry>.from(_draft!.entries);
    final int index = entries.indexWhere((SelectedEntry e) => e.entry.code == entry.code);
    if (index >= 0) {
      entries.removeAt(index);
    } else {
      entries.add(
        SelectedEntry(
          entry: entry,
          quantity: entry.defaultQuantity,
          coefficients: <String, double>{},
        ),
      );
    }
    _draft = _draft!.copyWith(entries: entries);
    notifyListeners();
  }

  Future<void> saveDraft() async {
    final ProjectDraft? current = _draft;
    if (current == null) {
      return;
    }
    final String sanitizedTitle = current.title.trim();
    if (sanitizedTitle.isEmpty) {
      _draft = current.copyWith(title: 'Черновик сметы');
    }
    _isBusy = true;
    notifyListeners();
    await _repository.upsert(_draft!);
    _isBusy = false;
    notifyListeners();
  }

  Future<void> updateSettings({
    CalculationMethod? method,
    String? region,
    String? indexProfile,
    String? title,
  }) async {
    if (_draft == null) {
      return;
    }
    _draft = _draft!.copyWith(
      method: method,
      region: region,
      indexProfile: indexProfile,
      title: title,
    );
    notifyListeners();
  }

  void updateDescription(String description) {
    if (_draft == null) {
      return;
    }
    final String trimmed = description.trim();
    if (trimmed.isEmpty) {
      return;
    }
    _draft = _draft!.copyWith(title: trimmed);
    notifyListeners();
  }
}
