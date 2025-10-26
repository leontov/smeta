import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/project.dart';
import '../../core/services/projects_controller.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  static const String route = '/';

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectsController>().refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final ProjectsController controller = context.watch<ProjectsController>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Смета №1'),
      ),
      body: RefreshIndicator(
        onRefresh: controller.refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: <Widget>[
            Card(
              child: ListTile(
                title: const Text('Создать смету по тексту'),
                subtitle: const Text('Опишите ТЗ словами и получите подбор норм ФСНБ/ФЕР'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () async {
                  await Navigator.of(context).pushNamed('/estimate');
                  if (!mounted) return;
                  await controller.refresh();
                },
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Сохранённые черновики',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (controller.isBusy)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (controller.projects.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(
                  child: Text(
                    'Черновики ещё не созданы. Запустите мастер и сохраните первую смету.',
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              ...controller.projects.map(
                (ProjectDraft draft) => _ProjectCard(
                  draft: draft,
                  onRefreshRequested: controller.refresh,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.draft, required this.onRefreshRequested});

  final ProjectDraft draft;
  final Future<void> Function() onRefreshRequested;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(draft.title),
        subtitle: Text(
          'Метод: ${draft.method == CalculationMethod.resource ? 'Ресурсный' : 'Базисно-индексный'} • Регион: ${draft.region}',
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () async {
          final bool? result = await Navigator.of(context).pushNamed('/project', arguments: draft.id) as bool?;
          if (result == true) {
            await onRefreshRequested();
          }
        },
      ),
    );
  }
}
