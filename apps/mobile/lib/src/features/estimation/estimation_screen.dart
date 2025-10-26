import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/normative_entry.dart';
import '../../core/models/project.dart';
import '../../core/services/estimation_controller.dart';

class EstimationScreen extends StatefulWidget {
  const EstimationScreen({super.key});

  static const String route = '/estimate';

  @override
  State<EstimationScreen> createState() => _EstimationScreenState();
}

class _EstimationScreenState extends State<EstimationScreen> {
  final TextEditingController _description = TextEditingController();
  final TextEditingController _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EstimationController>().initialize('');
    });
  }

  @override
  void dispose() {
    _description.dispose();
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final EstimationController controller = context.watch<EstimationController>();
    final ProjectDraft? draft = controller.draft;
    if (draft != null && _description.text.isEmpty) {
      _description.text = draft.title;
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Мастер составления сметы'),
      ),
      body: draft == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  TextField(
                    controller: _description,
                    decoration: const InputDecoration(
                      labelText: 'Описание проекта',
                      hintText: 'Например: отделка квартиры 60 м²',
                    ),
                    maxLines: 3,
                    onChanged: controller.updateDescription,
                  ),
                  const SizedBox(height: 16),
                  _CalculationSettings(draft: draft),
                  const Divider(height: 32),
                  TextField(
                    controller: _search,
                    decoration: InputDecoration(
                      labelText: 'Поиск норм',
                      suffixIcon: controller.isBusy
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : IconButton(
                              icon: const Icon(Icons.search),
                              onPressed: () => controller.searchCandidates(_search.text),
                            ),
                    ),
                    onSubmitted: (String value) => controller.searchCandidates(value),
                  ),
                  const SizedBox(height: 16),
                  if (controller.candidates.isEmpty)
                    const Text(
                      'Введите ключевые слова (например, "штукатурка стен") чтобы получить предложения.',
                    )
                  else
                    ...controller.candidates.map(
                      (NormativeEntry entry) => CheckboxListTile(
                        title: Text('${entry.code} • ${entry.title}'),
                        subtitle: Text('${entry.section} • Ед.: ${entry.unit}'),
                        value: draft.entries
                            .any((SelectedEntry selected) => selected.entry.code == entry.code),
                        onChanged: (_) => controller.toggleEntry(entry),
                      ),
                    ),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed: controller.isBusy
                        ? null
                        : () async {
                            await controller.saveDraft();
                            if (context.mounted) {
                              Navigator.of(context).pop();
                            }
                          },
                    icon: const Icon(Icons.save_alt),
                    label: const Text('Сохранить черновик'),
                  ),
                ],
              ),
            ),
    );
  }
}

class _CalculationSettings extends StatelessWidget {
  const _CalculationSettings({required this.draft});

  final ProjectDraft draft;

  @override
  Widget build(BuildContext context) {
    final EstimationController controller = context.watch<EstimationController>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text('Расчётные настройки', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<CalculationMethod>(
          value: draft.method,
          decoration: const InputDecoration(labelText: 'Метод расчёта'),
          items: CalculationMethod.values
              .map(
                (CalculationMethod method) => DropdownMenuItem<CalculationMethod>(
                  value: method,
                  child: Text(method == CalculationMethod.resource ? 'Ресурсный' : 'Базисно-индексный'),
                ),
              )
              .toList(),
          onChanged: (CalculationMethod? method) => controller.updateSettings(method: method),
        ),
        const SizedBox(height: 12),
        TextFormField(
          initialValue: draft.region,
          decoration: const InputDecoration(labelText: 'Регион'),
          onChanged: (String value) => controller.updateSettings(region: value),
        ),
        const SizedBox(height: 12),
        TextFormField(
          initialValue: draft.indexProfile,
          decoration: const InputDecoration(labelText: 'Профиль индексов Минстроя'),
          onChanged: (String value) => controller.updateSettings(indexProfile: value),
        ),
      ],
    );
  }
}
