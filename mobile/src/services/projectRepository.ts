import type { SQLResultSet, SQLTransaction } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

import { getDatabase } from '@/core/storage/database';
import { NormativeCandidate, NormativeMatchInput } from '@/core/workflow/generator';
import { ProjectDetail, ProjectNorm, ProjectSettings, ProjectSummary } from '@/types/project';

const DEFAULT_PROJECT_NAME = 'Без названия';

const normalizeSettings = (input: NormativeMatchInput): ProjectSettings => ({
  calculationMethod: input.calculationMethod,
  region: input.region?.trim() || null,
  indexProfile: input.indexProfile?.trim() || null
});

export const saveProjectDraft = async (
  input: NormativeMatchInput,
  selected: NormativeCandidate[]
): Promise<ProjectSummary> => {
  const db = getDatabase();
  const id = uuidv4();
  const name = input.projectName?.trim() ? input.projectName.trim() : DEFAULT_PROJECT_NAME;
  const description = input.description.trim();
  const createdAt = Date.now();
  const settings = normalizeSettings(input);

  await new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)`
            .trim(),
          [id, name, description, createdAt]
        );

        tx.executeSql(
          `INSERT OR REPLACE INTO project_settings (project_id, calculation_method, region, index_profile)
           VALUES (?, ?, ?, ?)`
            .trim(),
          [id, settings.calculationMethod, settings.region, settings.indexProfile]
        );

        selected.forEach((candidate, index) => {
          tx.executeSql(
            `INSERT INTO project_norms (project_id, code, title, collection, order_index)
             VALUES (?, ?, ?, ?, ?)`
              .trim(),
            [id, candidate.code, candidate.title, candidate.collection, index]
          );
        });
      },
      (error: Error) => reject(error),
      () => resolve()
    );
  });

  return {
    id,
    name,
    description,
    createdAt,
    itemsCount: selected.length,
    settings
  };
};

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const db = getDatabase();

  return new Promise<ProjectSummary[]>((resolve, reject) => {
    db.readTransaction((tx: SQLTransaction) => {
      tx.executeSql(
        `SELECT p.id,
                p.name,
                p.description,
                p.created_at as createdAt,
                COUNT(n.code) AS itemsCount,
                COALESCE(s.calculation_method, 'resource') as calculationMethod,
                s.region,
                s.index_profile as indexProfile
           FROM projects p
           LEFT JOIN project_norms n ON p.id = n.project_id
           LEFT JOIN project_settings s ON p.id = s.project_id
           GROUP BY p.id
           ORDER BY p.created_at DESC`
          .replace(/\s+/g, ' '),
        [],
        (_: SQLTransaction, result: SQLResultSet) => {
          const summaries: ProjectSummary[] = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            const row = result.rows.item(i);
            summaries.push({
              id: row.id,
              name: row.name,
              description: row.description,
              createdAt: row.createdAt,
              itemsCount: row.itemsCount,
              settings: {
                calculationMethod: row.calculationMethod,
                region: row.region,
                indexProfile: row.indexProfile
              }
            });
          }
          resolve(summaries);
        },
        (_: SQLTransaction, error: Error) => {
          reject(error);
          return false;
        }
      );
    }, (error: Error) => reject(error));
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = getDatabase();

  await new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(`DELETE FROM project_norms WHERE project_id = ?`.trim(), [id]);
        tx.executeSql(`DELETE FROM project_settings WHERE project_id = ?`.trim(), [id]);
        tx.executeSql(`DELETE FROM projects WHERE id = ?`.trim(), [id]);
      },
      (error: Error) => reject(error),
      () => resolve()
    );
  });
};

export const getProjectDetail = async (id: string): Promise<ProjectDetail | null> => {
  const db = getDatabase();

  return new Promise<ProjectDetail | null>((resolve, reject) => {
    db.readTransaction((tx: SQLTransaction) => {
      tx.executeSql(
        `SELECT p.id,
                p.name,
                p.description,
                p.created_at as createdAt,
                COALESCE(s.calculation_method, 'resource') as calculationMethod,
                s.region,
                s.index_profile as indexProfile
           FROM projects p
           LEFT JOIN project_settings s ON p.id = s.project_id
           WHERE p.id = ?
           LIMIT 1`
          .replace(/\s+/g, ' '),
        [id],
        (_: SQLTransaction, result: SQLResultSet) => {
          if (result.rows.length === 0) {
            resolve(null);
            return;
          }

          const row = result.rows.item(0);
          const summary: ProjectSummary = {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.createdAt,
            itemsCount: 0,
            settings: {
              calculationMethod: row.calculationMethod,
              region: row.region,
              indexProfile: row.indexProfile
            }
          };

          tx.executeSql(
            `SELECT code, title, collection, order_index as orderIndex
               FROM project_norms
               WHERE project_id = ?
               ORDER BY order_index ASC`
              .replace(/\s+/g, ' '),
            [id],
            (_: SQLTransaction, normsResult: SQLResultSet) => {
              const norms: ProjectNorm[] = [];
              for (let i = 0; i < normsResult.rows.length; i += 1) {
                norms.push(normsResult.rows.item(i) as ProjectNorm);
              }

              resolve({
                ...summary,
                itemsCount: norms.length,
                norms
              });
            },
            (_: SQLTransaction, normsError: Error) => {
              reject(normsError);
              return false;
            }
          );
        },
        (_: SQLTransaction, error: Error) => {
          reject(error);
          return false;
        }
      );
    }, (error: Error) => reject(error));
  });
};
