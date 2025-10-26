import 'package:intl/intl.dart';
import 'normative_entry.dart';

class ProjectDraft {
  ProjectDraft({
    required this.id,
    required this.title,
    required this.createdAt,
    required this.method,
    required this.region,
    required this.indexProfile,
    required this.entries,
    required this.notes,
  });

  factory ProjectDraft.initial(String description) {
    final DateTime now = DateTime.now();
    return ProjectDraft(
      id: now.microsecondsSinceEpoch.toString(),
      title: description.isEmpty
          ? 'Новый черновик от ${DateFormat('dd.MM.yyyy').format(now)}'
          : description,
      createdAt: now,
      method: CalculationMethod.resource,
      region: 'Москва',
      indexProfile: 'Базовый',
      entries: <SelectedEntry>[],
      notes: '',
    );
  }

  final String id;
  final String title;
  final DateTime createdAt;
  final CalculationMethod method;
  final String region;
  final String indexProfile;
  final List<SelectedEntry> entries;
  final String notes;

  ProjectDraft copyWith({
    String? title,
    CalculationMethod? method,
    String? region,
    String? indexProfile,
    List<SelectedEntry>? entries,
    String? notes,
  }) {
    return ProjectDraft(
      id: id,
      title: title ?? this.title,
      createdAt: createdAt,
      method: method ?? this.method,
      region: region ?? this.region,
      indexProfile: indexProfile ?? this.indexProfile,
      entries: entries ?? this.entries,
      notes: notes ?? this.notes,
    );
  }
}

enum CalculationMethod { resource, baseIndex }

class SelectedEntry {
  SelectedEntry({
    required this.entry,
    required this.quantity,
    required this.coefficients,
  });

  final NormativeEntry entry;
  final double quantity;
  final Map<String, double> coefficients;
}
