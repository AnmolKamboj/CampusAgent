import { FormType, DeadlineReminder, FormConfig } from '../types.js';
import { formConfigService } from './formConfigService.js';

export class DeadlineService {
  // In-memory storage (replace with database in production)
  private reminders: Map<string, DeadlineReminder[]>;

  constructor() {
    this.reminders = new Map();
  }

  // Get deadline for a form type
  getDeadline(formType: FormType): Date | null {
    const config = formConfigService.getConfig(formType);
    return config?.deadline || null;
  }

  // Check if deadline is approaching
  checkDeadlineWarning(formType: FormType, daysBefore: number = 7): boolean {
    const deadline = this.getDeadline(formType);
    if (!deadline) return false;

    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilDeadline <= daysBefore && daysUntilDeadline > 0;
  }

  // Get days until deadline
  getDaysUntilDeadline(formType: FormType): number | null {
    const deadline = this.getDeadline(formType);
    if (!deadline) return null;

    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  }

  // Create or update reminder
  async createReminder(
    formType: FormType,
    studentId: string,
    deadline: Date
  ): Promise<DeadlineReminder> {
    const reminder: DeadlineReminder = {
      formType,
      studentId,
      deadline,
      reminderSent: false,
    };

    const studentReminders = this.reminders.get(studentId) || [];
    studentReminders.push(reminder);
    this.reminders.set(studentId, studentReminders);

    return reminder;
  }

  // Get reminders for a student
  getReminders(studentId: string): DeadlineReminder[] {
    return this.reminders.get(studentId) || [];
  }

  // Check and send reminders (should be called periodically)
  async checkAndSendReminders(): Promise<DeadlineReminder[]> {
    const remindersToSend: DeadlineReminder[] = [];
    const now = new Date();

    for (const [_studentId, reminders] of this.reminders.entries()) {
      for (const reminder of reminders) {
        if (reminder.reminderSent) continue;

        const config = formConfigService.getConfig(reminder.formType);
        if (!config?.deadlineReminderDays) continue;

        const daysUntil = Math.ceil((reminder.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we should send a reminder today
        if (config.deadlineReminderDays.includes(daysUntil)) {
          reminder.reminderSent = true;
          reminder.reminderDate = now;
          remindersToSend.push(reminder);
        }
      }
    }

    return remindersToSend;
  }

  // Generate reminder message
  generateReminderMessage(reminder: DeadlineReminder, config: FormConfig): string {
    const daysUntil = this.getDaysUntilDeadline(reminder.formType) || 0;
    const deadlineStr = reminder.deadline.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (daysUntil <= 0) {
      return `⚠️ URGENT: The deadline for ${config.name} has passed or is today (${deadlineStr}). Please submit your form immediately!`;
    } else if (daysUntil === 1) {
      return `⚠️ Reminder: The deadline for ${config.name} is tomorrow (${deadlineStr}). Please submit your form soon!`;
    } else {
      return `📅 Reminder: The deadline for ${config.name} is in ${daysUntil} days (${deadlineStr}). Don't forget to submit your form!`;
    }
  }

  // Get deadline status message
  getDeadlineStatusMessage(formType: FormType): string | null {
    const deadline = this.getDeadline(formType);
    if (!deadline) return null;

    const daysUntil = this.getDaysUntilDeadline(formType);
    if (daysUntil === null) return null;

    const deadlineStr = deadline.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (daysUntil < 0) {
      return `⚠️ Deadline passed: ${deadlineStr}`;
    } else if (daysUntil === 0) {
      return `⚠️ Deadline is today: ${deadlineStr}`;
    } else if (daysUntil <= 7) {
      return `⚠️ Deadline in ${daysUntil} days: ${deadlineStr}`;
    } else {
      return `📅 Deadline: ${deadlineStr} (${daysUntil} days remaining)`;
    }
  }
}

export const deadlineService = new DeadlineService();

