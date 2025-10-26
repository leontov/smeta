import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { RootStackParamList } from '@/navigation/RootNavigator';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useProjectsStore } from '@/state/projectsStore';
import { ProjectSummary } from '@/types/project';

interface ProjectCardProps {
  project: ProjectSummary;
  onPress: () => void;
  key?: string | number;
}

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { projects, loadProjects } = useProjectsStore();

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.title}>Из текста → смета</Text>
          <Text style={styles.subtitle}>
            Сканируйте техническое задание, диктуйте голосом или вставляйте текст, чтобы получить черновик
            сметы по ФЕР/ГЭСН за минуты.
          </Text>
          <PrimaryButton
            label="Создать смету"
            onPress={() => navigation.navigate('Estimation')}
            accessibilityLabel="Начать новый проект"
          />
          <TouchableOpacity style={styles.secondary}>
            <Text style={styles.secondaryLabel}>Импортировать из XML / XLSX</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>Последние сметы</Text>
          {projects.length === 0 ? (
            <Text style={styles.empty}>Сохраните первую смету, чтобы увидеть её в списке проектов.</Text>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const ProjectCard = ({ project, onPress }: ProjectCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.86}
    accessibilityRole="button"
    accessibilityLabel={`Открыть черновик ${project.name}`}
  >
    <View style={styles.projectCard}>
      <Text style={styles.projectTitle}>{project.name}</Text>
      <Text style={styles.projectMeta}>
        {formatDate(project.createdAt)} · {project.itemsCount} позиций
      </Text>
      <Text style={styles.projectMeta}>{describeSettings(project)}</Text>
      {project.description ? (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const describeSettings = (project: ProjectSummary): string => {
  const method =
    project.settings.calculationMethod === 'resource'
      ? 'ресурсный метод'
      : 'базисно-индексный метод';
  const parts = [method];
  if (project.settings.region) {
    parts.push(`регион: ${project.settings.region}`);
  }
  if (project.settings.indexProfile) {
    parts.push(`индексы: ${project.settings.indexProfile}`);
  }
  return parts.join(' · ');
};

const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString('ru-RU');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB'
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48
  },
  hero: {
    marginBottom: 32
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#415A77',
    marginBottom: 24
  },
  secondary: {
    marginTop: 24,
    alignItems: 'center'
  },
  secondaryLabel: {
    color: '#1B263B',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  listWrapper: {
    gap: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1B2A'
  },
  empty: {
    color: '#415A77',
    fontSize: 16
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    gap: 8
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B263B'
  },
  projectMeta: {
    color: '#778DA9',
    fontSize: 14
  },
  projectDescription: {
    color: '#415A77',
    fontSize: 14
  }
});
