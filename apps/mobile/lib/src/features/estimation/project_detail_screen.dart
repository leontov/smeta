import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/project.dart';
import '../../core/services/project_repository.dart';

class ProjectDetailScreen extends StatefulWidget {
  const ProjectDetailScreen({super.key, required this.projectId});

  static const String route = '/project';

  final String projectId;

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  ProjectDraft? _draft;
  bool _isBusy = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final ProjectRepository repository = context.read<ProjectRepository>();
    await repository.ensureInitialized();
    final ProjectDraft? draft = await repository.findById(widget.projectId);
    setState(() {
      _draft = draft;
      _isBusy = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Детали сметы'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.delete_forever),
            onPressed: _draft == null
                ? null
                : () async {
                    final bool? confirm = await showDialog<bool>(
                      context: context,
                      builder: (BuildContext context) => AlertDialog(
                        title: const Text('Удалить смету?'),
                        content: const Text('Действие нельзя отменить. Документ будет удалён с устройства.'),
                        actions: <Widget>[
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('Отмена'),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            child: const Text('Удалить'),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true) {
                      await context.read<ProjectRepository>().delete(widget.projectId);
                      if (context.mounted) {
                        Navigator.of(context).pop(true);
                      }
                    }
                  },
          ),
        ],
      ),
      body: _isBusy
          ? const Center(child: CircularProgressIndicator())
          : _draft == null
              ? const Center(child: Text('Черновик не найден'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: <Widget>[
                    Card(
                      child: ListTile(
                        title: Text(_draft!.title),
                        subtitle: Text(
                          '''Метод: ${_draft!.method == CalculationMethod.resource ? 'Ресурсный' : 'Базисно-индексный'}
Регион: ${_draft!.region}
Индексы: ${_draft!.indexProfile}''',
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text('Подобранные нормы', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    ..._draft!.entries.map(
                      (SelectedEntry entry) => Card(
                        child: ListTile(
                          title: Text('${entry.entry.code} • ${entry.entry.title}'),
                          subtitle: Text('Количество: ${entry.quantity} ${entry.entry.unit}'),
                        ),
                      ),
                    ),
                    if (_draft!.entries.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 48),
                        child: Text('На этапе подбора пока нет норм. Вернитесь в мастер и добавьте позиции.'),
                      ),
                  ],
                ),
    );
  }
}
