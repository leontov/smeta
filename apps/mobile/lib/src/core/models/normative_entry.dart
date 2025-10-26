import 'dart:convert';

class NormativeEntry {
  const NormativeEntry({
    required this.code,
    required this.title,
    required this.unit,
    required this.section,
    required this.defaultQuantity,
    required this.explanation,
  });

  factory NormativeEntry.fromJson(Map<String, dynamic> json) {
    return NormativeEntry(
      code: json['code'] as String,
      title: json['title'] as String,
      unit: json['unit'] as String,
      section: json['section'] as String? ?? 'Общие работы',
      defaultQuantity: (json['defaultQuantity'] as num?)?.toDouble() ?? 1,
      explanation: json['explanation'] as String? ?? '',
    );
  }

  final String code;
  final String title;
  final String unit;
  final String section;
  final double defaultQuantity;
  final String explanation;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'title': title,
      'unit': unit,
      'section': section,
      'defaultQuantity': defaultQuantity,
      'explanation': explanation,
    };
  }

  static List<NormativeEntry> decodeList(String raw) {
    final dynamic json = jsonDecode(raw);
    if (json is List<dynamic>) {
      return json
          .map((dynamic item) =>
              NormativeEntry.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return const <NormativeEntry>[];
  }
}
