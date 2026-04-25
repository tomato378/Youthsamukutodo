import { TaskAssigneeRole, TaskTemplate } from './types'

/**
 * Assignment rules:
 * - member1: event planning, content, scripts (企画・コンテンツ・台本)
 * - member2: promotion, forms, communication (告知・フォーム・連絡)
 * - member3: venue, equipment, operations (会場・備品・当日運営)
 * - unassigned: cross-functional decisions and final checks
 *
 * Future: move this to an admin-editable database table
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  // 30 days before
  { templateKey: 'overview', title: 'イベント概要を決める', daysBeforeEvent: 30, assigneeRole: 'member1' },
  { templateKey: 'datetime_confirm', title: '開催日時を確定する', daysBeforeEvent: 30, assigneeRole: 'unassigned' },
  { templateKey: 'venue_secure', title: '会場を確保する', daysBeforeEvent: 30, assigneeRole: 'member3' },
  { templateKey: 'roles_draft', title: '運営メンバーの役割を仮決定する', daysBeforeEvent: 30, assigneeRole: 'unassigned' },

  // 21 days before
  { templateKey: 'plan_detail', title: '企画内容を具体化する', daysBeforeEvent: 21, assigneeRole: 'member1' },
  { templateKey: 'flow_draft', title: '当日の流れを仮作成する', daysBeforeEvent: 21, assigneeRole: 'member1' },
  { templateKey: 'form_create', title: '募集フォームを作成する', daysBeforeEvent: 21, assigneeRole: 'member2' },
  { templateKey: 'announcement_text', title: '告知文を作成する', daysBeforeEvent: 21, assigneeRole: 'member2' },

  // 14 days before
  { templateKey: 'announcement_image', title: '告知画像を作成する', daysBeforeEvent: 14, assigneeRole: 'member2' },
  { templateKey: 'sns_post', title: 'SNSで告知する', daysBeforeEvent: 14, assigneeRole: 'member2' },
  { templateKey: 'stakeholder_share', title: '関係者に共有する', daysBeforeEvent: 14, assigneeRole: 'unassigned' },
  { templateKey: 'foreign_guide', title: '外国人参加者への案内文を作成する', daysBeforeEvent: 14, assigneeRole: 'member1' },

  // 7 days before
  { templateKey: 'participant_remind', title: '参加者にリマインドする', daysBeforeEvent: 7, assigneeRole: 'member2' },
  { templateKey: 'roles_confirm', title: '当日の役割分担を確定する', daysBeforeEvent: 7, assigneeRole: 'unassigned' },
  { templateKey: 'equipment_check', title: '必要な備品を確認する', daysBeforeEvent: 7, assigneeRole: 'member3' },
  { templateKey: 'script_create', title: '進行台本を作成する', daysBeforeEvent: 7, assigneeRole: 'member1' },

  // 3 days before
  { templateKey: 'final_contact', title: '参加者に最終連絡を送る', daysBeforeEvent: 3, assigneeRole: 'member2' },
  { templateKey: 'venue_equipment_confirm', title: '会場・備品・集合時間を確認する', daysBeforeEvent: 3, assigneeRole: 'member3' },
  { templateKey: 'incomplete_tasks', title: '未完了タスクを洗い出す', daysBeforeEvent: 3, assigneeRole: 'unassigned' },

  // 1 day before
  { templateKey: 'flow_final', title: '当日の流れを最終確認する', daysBeforeEvent: 1, assigneeRole: 'member1' },
  { templateKey: 'team_final_check', title: '運営メンバーで最終確認する', daysBeforeEvent: 1, assigneeRole: 'unassigned' },
  { templateKey: 'belongings_check', title: '持ち物を確認する', daysBeforeEvent: 1, assigneeRole: 'member3' },
]
