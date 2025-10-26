import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { deleteProject, getProjectDetail } from '@/services/projectRepository';
import { ProjectDetail, ProjectNorm } from '@/types/project';
import { useProjectsStore } from '@/state/projectsStore';

const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString('ru-RU');

export const ProjectDetailScreen = ({
  route,
  navigation
}: NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>) => {
  const { projectId } = route.params;
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const removeProject = useProjectsStore((state) => state.removeProject);

  const load = async (withSpinner = false) => {
    if (withSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const project = await getProjectDetail(projectId);
      if (!project) {
        setError('Черновик не найден. Возможно, он был удалён.');
      }
      setDetail(project);
      setConfirmDelete(false);
      setDeleteError(null);
    } catch (err) {
      console.error('Failed to load project detail', err);
      setError('Не удалось загрузить черновик. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: detail?.name ?? 'Черновик сметы' });
  }, [detail?.name, navigation]);

  useEffect(() => {
    load(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const handleDeletePress = async () => {
    if (!detail || isDeleting) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      setDeleteError(null);
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteProject(detail.id);
      removeProject(detail.id);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete project', err);
      setDeleteError('Не удалось удалить черновик. Попробуйте ещё раз.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B263B" />
        <Text style={styles.loadingLabel}>Загружаем черновик…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <PrimaryButton label="Попробовать снова" onPress={() => load(true)} />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Черновик не найден.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={detail.norms}
      keyExtractor={(item: ProjectNorm) => item.code}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.heading}>{detail.name}</Text>
          <Text style={styles.meta}>
            Создано {formatDateTime(detail.createdAt)} · {detail.itemsCount} позиций
          </Text>
          <View style={styles.settingsBlock}>
            <Text style={styles.settingsTitle}>Настройки расчёта</Text>
            <Text style={styles.settingsValue}>{describeMethod(detail)}</Text>
            {detail.settings.region ? (
              <Text style={styles.settingsValue}>Регион: {detail.settings.region}</Text>
            ) : null}
            {detail.settings.indexProfile ? (
              <Text style={styles.settingsValue}>Индексы: {detail.settings.indexProfile}</Text>
            ) : null}
          </View>
          {detail.description ? <Text style={styles.description}>{detail.description}</Text> : null}
          <View style={styles.actions}>
            <PrimaryButton
              label="Экспортировать (скоро)"
              onPress={() => {}}
              disabled
              accessibilityHint="Экспорт появится в ближайших обновлениях"
            />
            <PrimaryButton
              label={confirmDelete ? 'Подтвердить удаление' : 'Удалить черновик'}
              onPress={handleDeletePress}
              variant="danger"
              loading={isDeleting}
              accessibilityHint="Удаление черновика удалит нормы и настройки из локальной базы"
            />
            {confirmDelete ? (
              <Text style={styles.deleteHint}>Нажмите ещё раз, чтобы подтвердить удаление.</Text>
            ) : null}
            {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
          </View>
          <Text style={styles.sectionTitle}>Подобранные нормы</Text>
        </View>
      }
      renderItem={({ item, index }: { item: ProjectNorm; index: number }) => <ProjectNormCard position={index + 1} norm={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text style={styles.empty}>Нет сохранённых норм для этого черновика.</Text>}
      contentContainerStyle={styles.content}
    />
  );
};

const describeMethod = (detail: ProjectDetail) =>
  detail.settings.calculationMethod === 'resource'
    ? 'Ресурсный метод'
    : 'Базисно-индексный метод';

const ProjectNormCard = ({ position, norm }: { position: number; norm: ProjectNorm }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardIndex}>{position.toString().padStart(2, '0')}</Text>
      <View style={styles.cardInfo}>
        <Text style={styles.cardCode}>{norm.code}</Text>
        <Text style={styles.cardTitle}>{norm.title}</Text>
      </View>
    </View>
    <View style={styles.explainBox}>
      <Text style={styles.explainTitle}>Обоснование</Text>
      <Text style={styles.explainText}>
        Код {norm.code} выбран на этапе сопоставления по совпадению ключевых слов с техническим заданием.
        На следующих этапах сюда добавятся коэффициенты, индексы и ссылки на источники.
      </Text>
    </View>
    <Text style={styles.collection}>{norm.collection}</Text>
  </View>
);

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#F6F7FB'
  },
  content: {
    padding: 20,
    paddingBottom: 32
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F6F7FB'
  },
  loadingLabel: {
    marginTop: 12,
    color: '#415A77'
  },
  error: {
    fontSize: 16,
    color: '#9E2B25',
    textAlign: 'center',
    marginBottom: 16
  },
  header: {
    gap: 12,
    marginBottom: 12
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1B2A'
  },
  meta: {
    fontSize: 14,
    color: '#778DA9'
  },
  description: {
    fontSize: 16,
    color: '#415A77'
  },
  settingsBlock: {
    backgroundColor: '#1B263B',
    borderRadius: 16,
    padding: 16,
    gap: 6
  },
  settingsTitle: {
    color: '#D6E2FF',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  settingsValue: {
    color: '#FFFFFF',
    fontSize: 16
  },
  actions: {
    marginTop: 8,
    alignItems: 'flex-start',
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
    marginTop: 8
  },
  separator: {
    height: 16
  },
  empty: {
    color: '#415A77',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cardIndex: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B263B'
  },
  cardInfo: {
    flex: 1,
    gap: 4
  },
  cardCode: {
    fontSize: 14,
    color: '#1B263B',
    fontWeight: '600'
  },
  cardTitle: {
    fontSize: 16,
    color: '#0D1B2A'
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
  collection: {
    fontSize: 14,
    color: '#415A77'
  },
  deleteHint: {
    color: '#9E2B25',
    fontSize: 13
  },
  deleteError: {
    color: '#9E2B25',
    fontSize: 14
  }
});
