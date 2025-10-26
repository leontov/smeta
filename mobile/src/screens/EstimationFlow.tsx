import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { PrimaryButton } from '@/components/PrimaryButton';
import { NormativeCandidate, NormativeMatchInput } from '@/core/workflow/generator';
import { useEstimationStore } from '@/state/estimationStore';
import { CalculationMethod } from '@/types/project';

export const EstimationFlow = () => {
  const {
    stage,
    submitInput,
    candidates,
    toggleCandidate,
    selectedCandidateIds,
    setStage,
    reset,
    finalizeSelection,
    projectSummary
  } = useEstimationStore();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [region, setRegion] = useState('');
  const [indexProfile, setIndexProfile] = useState('');
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('resource');
  const [isSaving, setIsSaving] = useState(false);

  const selectedCount = selectedCandidateIds.size;
  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => selectedCandidateIds.has(candidate.code)),
    [candidates, selectedCandidateIds]
  );

  const finalize = async () => {
    setIsSaving(true);
    try {
      await finalizeSelection();
    } catch (error) {
      console.error('Finalize selection failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const submit = async () => {
    const payload: NormativeMatchInput = {
      projectName,
      description,
      area: area ? Number(area) : undefined,
      region: region.trim() || undefined,
      indexProfile: indexProfile.trim() || undefined,
      calculationMethod
    };
    await submitInput(payload);
  };

  if (stage === 'input') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Описание проекта</Text>
        <TextInput
          placeholder="Название проекта"
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
        />
        <TextInput
          placeholder="Краткое текстовое описание работ"
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          placeholder="Площадь, м² (опционально)"
          style={styles.input}
          keyboardType="numeric"
          value={area}
          onChangeText={setArea}
        />
        <Text style={styles.sectionTitle}>Метод расчёта</Text>
        <View style={styles.toggleGroup}>
          <MethodToggle
            label="Ресурсный"
            active={calculationMethod === 'resource'}
            onPress={() => setCalculationMethod('resource')}
          />
          <MethodToggle
            label="Базисно-индексный"
            active={calculationMethod === 'base-index'}
            onPress={() => setCalculationMethod('base-index')}
          />
        </View>
        <TextInput
          placeholder="Регион работ (например, Москва)"
          style={styles.input}
          value={region}
          onChangeText={setRegion}
        />
        <TextInput
          placeholder="Профиль индексов (например, Минстрой, 1 квартал 2024)"
          style={styles.input}
          value={indexProfile}
          onChangeText={setIndexProfile}
        />
        <PrimaryButton label="Сопоставить нормы" onPress={submit} disabled={!description} />
      </View>
    );
  }

  if (stage === 'matching') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Кандидаты норм</Text>
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CandidateRow
              candidate={item}
              selected={selectedCandidateIds.has(item.code)}
              onToggle={() => toggleCandidate(item.code)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Не найдено подходящих норм. Уточните описание.</Text>
          )}
        />
        <PrimaryButton
          label={`Продолжить (${selectedCount})`}
          onPress={() => setStage('review')}
          disabled={selectedCount === 0}
        />
      </View>
    );
  }

  if (stage === 'review') {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Подбор ресурсов</Text>
        <FlatList
          data={selectedCandidates}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <SelectedCandidateCard candidate={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <PrimaryButton
          label="Сохранить черновик"
          onPress={finalize}
          loading={isSaving}
          disabled={selectedCount === 0}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedCandidates}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.documentsHeader}>
            <Text style={styles.sectionTitle}>Документы</Text>
            {projectSummary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{projectSummary.name}</Text>
                <Text style={styles.summaryMeta}>
                  Черновик создан {formatDate(projectSummary.createdAt)}
                </Text>
                <Text style={styles.summaryMeta}>Позиции: {projectSummary.itemsCount}</Text>
                <Text style={styles.summaryMeta}>
                  Метод: {projectSummary.settings.calculationMethod === 'resource'
                    ? 'ресурсный'
                    : 'базисно-индексный'}
                </Text>
                {projectSummary.settings.region ? (
                  <Text style={styles.summaryMeta}>
                    Регион: {projectSummary.settings.region}
                  </Text>
                ) : null}
                {projectSummary.settings.indexProfile ? (
                  <Text style={styles.summaryMeta}>
                    Индексы: {projectSummary.settings.indexProfile}
                  </Text>
                ) : null}
                {projectSummary.description ? (
                  <Text style={styles.summaryDescription}>{projectSummary.description}</Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.empty}>
                Черновик сохранён. Экспорт КС-2/КС-3, PDF и CommerceML появится на следующем этапе.
              </Text>
            )}
            <Text style={styles.summarySubtitle}>Подобранные нормы</Text>
          </View>
        }
        renderItem={({ item }) => <SelectedCandidateCard candidate={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>Нет выбранных норм для отображения.</Text>
        )}
        ListFooterComponent={
          <View style={styles.footerActions}>
            <PrimaryButton label="Вернуться к началу" onPress={reset} />
          </View>
        }
      />
    </View>
  );
};

const MethodToggle = ({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.toggleButton, active && styles.toggleButtonActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString('ru-RU');

const CandidateRow = ({
  candidate,
  selected,
  onToggle
}: {
  candidate: NormativeCandidate;
  selected: boolean;
  onToggle: () => void;
}) => (
  <View style={[styles.card, selected && styles.cardSelected]}>
    <View style={{ flex: 1 }}>
      <Text style={styles.code}>{candidate.code}</Text>
      <Text style={styles.title}>{candidate.title}</Text>
      <Text style={styles.meta}>{candidate.collection}</Text>
    </View>
    <View style={styles.cardActions}>
      <PrimaryButton label={selected ? 'Удалить' : 'Добавить'} onPress={onToggle} />
    </View>
  </View>
);

const SelectedCandidateCard = ({ candidate }: { candidate: NormativeCandidate }) => (
  <View style={styles.card}>
    <View style={{ flex: 1, marginBottom: 12 }}>
      <Text style={styles.code}>{candidate.code}</Text>
      <Text style={styles.title}>{candidate.title}</Text>
    </View>
    <View style={styles.explainBox}>
      <Text style={styles.explainTitle}>Обоснование</Text>
      <Text style={styles.explainText}>
        Норма выбрана на основе совпадения ключевых слов и технических характеристик проекта. На следующем
        шаге сюда будет добавлен разбор условий применения и коэффициентов.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#BCCCDC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12
  },
  multiline: {
    height: 160,
    textAlignVertical: 'top'
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BCCCDC',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  toggleButtonActive: {
    backgroundColor: '#1B263B',
    borderColor: '#1B263B'
  },
  toggleLabel: {
    color: '#1B263B',
    fontSize: 16,
    fontWeight: '600'
  },
  toggleLabelActive: {
    color: '#FFFFFF'
  },
  separator: {
    height: 12
  },
  listContent: {
    paddingBottom: 16
  },
  empty: {
    color: '#415A77',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    flexDirection: 'column',
    marginBottom: 12
  },
  cardSelected: {
    borderColor: '#1B263B'
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B263B'
  },
  title: {
    fontSize: 16,
    color: '#0D1B2A'
  },
  meta: {
    fontSize: 14,
    color: '#778DA9'
  },
  cardActions: {
    marginTop: 12,
    alignItems: 'flex-start'
  },
  explainBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12
  },
  explainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B263B',
    marginBottom: 4
  },
  explainText: {
    fontSize: 14,
    color: '#415A77'
  },
  documentsHeader: {
    gap: 12
  },
  summaryCard: {
    backgroundColor: '#1B263B',
    borderRadius: 16,
    padding: 16,
    gap: 8
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  summaryMeta: {
    color: '#D6E2FF',
    fontSize: 14
  },
  summaryDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12
  },
  summarySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginTop: 12
  },
  footerActions: {
    marginTop: 24
  }
});
