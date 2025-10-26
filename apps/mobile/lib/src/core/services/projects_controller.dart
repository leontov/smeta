import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/project.dart';
import 'project_repository.dart';

class ProjectsController extends ChangeNotifier {
  ProjectsController(this._repository);

  final ProjectRepository _repository;

  List<ProjectDraft> _projects = <ProjectDraft>[];
  bool _isBusy = false;

  List<ProjectDraft> get projects => _projects;
  bool get isBusy => _isBusy;

  Future<void> refresh() async {
    _isBusy = true;
    notifyListeners();
    await _repository.ensureInitialized();
    _projects = await _repository.listProjects();
    _isBusy = false;
    notifyListeners();
  }

  Future<void> remove(String id) async {
    await _repository.delete(id);
    await refresh();
  }
}
