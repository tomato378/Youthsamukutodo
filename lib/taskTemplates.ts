import { TaskAssigneeRole, TaskTemplate } from './types'

/**
 * Assignment rules:
 * - member1: event planning, content, scripts (企画・コンテンツ・台本)
 * - member2: promotion, flyer, social, communication (集客・フライヤー・告知・連絡)
 * - member3: venue, equipment, operations (会場・備品・当日運営)
 * - unassigned: cross-functional decisions and final checks
 *
 * Future: move this to an admin-editable database table
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  // ── 30日前: 企画スタート ────────────────────────
  { templateKey: 'overview',        title: 'イベント概要・ターゲットを決める',      daysBeforeEvent: 30, assigneeRole: 'member1' },
  { templateKey: 'datetime_confirm',title: '開催日時を確定する',                    daysBeforeEvent: 30, assigneeRole: 'unassigned' },
  { templateKey: 'venue_secure',    title: '会場を確保する',                        daysBeforeEvent: 30, assigneeRole: 'member3' },
  { templateKey: 'roles_draft',     title: '運営メンバーの役割を仮決定する',        daysBeforeEvent: 30, assigneeRole: 'unassigned' },

  // ── 28日前: 集客計画スタート ─────────────────────
  { templateKey: 'promo_goal',      title: '集客目標人数と告知チャネルを決める',    daysBeforeEvent: 28, assigneeRole: 'member2' },
  { templateKey: 'flyer_concept',   title: 'フライヤーのデザイン・文面を企画する',  daysBeforeEvent: 28, assigneeRole: 'member2' },

  // ── 21日前: 告知素材づくり ───────────────────────
  { templateKey: 'plan_detail',     title: '企画内容を具体化する',                  daysBeforeEvent: 21, assigneeRole: 'member1' },
  { templateKey: 'flow_draft',      title: '当日の流れを仮作成する',                daysBeforeEvent: 21, assigneeRole: 'member1' },
  { templateKey: 'form_create',     title: '申込フォームを作成・公開する',           daysBeforeEvent: 21, assigneeRole: 'member2' },
  { templateKey: 'announcement_text', title: '告知文（SNS用・日本語）を作成する',   daysBeforeEvent: 21, assigneeRole: 'member2' },
  { templateKey: 'foreign_copy',    title: '外国人参加者向け告知文（英語）を作成する', daysBeforeEvent: 21, assigneeRole: 'member1' },
  { templateKey: 'sns_schedule',    title: 'SNS投稿スケジュールを組む',             daysBeforeEvent: 21, assigneeRole: 'member2' },

  // ── 14日前: フライヤー完成・一斉告知 ─────────────
  { templateKey: 'flyer_finish',    title: 'フライヤー（デジタル版）を完成させる',  daysBeforeEvent: 14, assigneeRole: 'member2' },
  { templateKey: 'sns_launch',      title: 'SNS・LINEで一斉告知を開始する',         daysBeforeEvent: 14, assigneeRole: 'member2' },
  { templateKey: 'stakeholder_share', title: '関係者・コミュニティに拡散依頼する',  daysBeforeEvent: 14, assigneeRole: 'unassigned' },
  { templateKey: 'foreign_guide',   title: '外国人参加者への個別案内を送る',        daysBeforeEvent: 14, assigneeRole: 'member1' },

  // ── 7日前: リマインド・最終調整 ──────────────────
  { templateKey: 'registration_check', title: '申込状況を確認し追加集客を検討する', daysBeforeEvent: 7, assigneeRole: 'member2' },
  { templateKey: 'participant_remind', title: '参加者にリマインドメッセージを送る', daysBeforeEvent: 7, assigneeRole: 'member2' },
  { templateKey: 'roles_confirm',   title: '当日の役割分担を確定する',              daysBeforeEvent: 7, assigneeRole: 'unassigned' },
  { templateKey: 'equipment_check', title: '必要な備品リストを確認・手配する',      daysBeforeEvent: 7, assigneeRole: 'member3' },
  { templateKey: 'script_create',   title: '進行台本を作成する',                    daysBeforeEvent: 7, assigneeRole: 'member1' },

  // ── 3日前: 最終連絡 ──────────────────────────────
  { templateKey: 'final_contact',   title: '参加者に会場・集合時間の最終案内を送る', daysBeforeEvent: 3, assigneeRole: 'member2' },
  { templateKey: 'venue_confirm',   title: '会場・備品・集合時間を再確認する',      daysBeforeEvent: 3, assigneeRole: 'member3' },
  { templateKey: 'incomplete_tasks', title: '未完了タスクを洗い出し完了させる',     daysBeforeEvent: 3, assigneeRole: 'unassigned' },

  // ── 前日: 最終仕上げ ─────────────────────────────
  { templateKey: 'flow_final',      title: '当日の流れを最終確認する',              daysBeforeEvent: 1, assigneeRole: 'member1' },
  { templateKey: 'team_final_check', title: '運営メンバーで前日最終確認をする',     daysBeforeEvent: 1, assigneeRole: 'unassigned' },
  { templateKey: 'belongings_check', title: '持ち物・備品を最終確認する',           daysBeforeEvent: 1, assigneeRole: 'member3' },
]
