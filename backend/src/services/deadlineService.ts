import { FormType, DeadlineReminder } from '../types.js';

// In-memory storage for deadlines (replace with database in production)
const deadlines: Map<FormType, Date> = new Map();
const reminders: Map<string, DeadlineReminder> = new Map();

export class DeadlineService {
  // Set deadline for a form type
  setDeadline(formType: FormType, deadline: Date): void {
    deadlines.set(formType, deadline);
  }

  // Get deadline for a form type
  getDeadline(formType: FormType): Date | null {
    return deadlines.get(formType) || null;
  }

  // Check if deadline is approaching (within N days)
  checkDeadlineWarning(formType: FormType, daysBeforeWarning: number): boolean {
    const deadline = deadlines.get(formType);
    if (!deadline) {
      return false;
    }

    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilDeadline <= daysBeforeWarning && daysUntilDeadline >= 0;
  }

  // Check if deadline has passed
  isDeadlinePassed(formType: FormType): boolean {
    const deadline = deadlines.get(formType);
    if (!deadline) {
      return false;
    }

    return new Date() > deadline;
  }

  // Add reminder for a student
  addReminder(reminder: DeadlineReminder): void {
    const key = `${reminder.formType}-${reminder.studentId}`;
    reminders.set(key, reminder);
  }

  // Get reminder for a student
  getReminder(formType: FormType, studentId: string): DeadlineReminder | undefined {
    const key = `${formType}-${studentId}`;
    return reminders.get(key);
  }

  // Mark reminder as sent
  markReminderSent(formType: FormType, studentId: string): void {
    const key = `${formType}-${studentId}`;
    const reminder = reminders.get(key);
    if (reminder) {
      reminder.reminderSent = true;
      reminder.reminderDate = new Date();
      reminders.set(key, reminder);
    }
  }

  // Get a human-readable deadline status message
  getDeadlineStatusMessage(formType: FormType): string | null {
    const deadline = deadlines.get(formType);
    if (!deadline) {
      return null;
    }

    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) {
      return `⚠️ **Deadline passed** (${Math.abs(daysUntilDeadline)} days ago)`;
    } else if (daysUntilDeadline === 0) {
      return `🔴 **Deadline is TODAY!**`;
    } else if (daysUntilDeadline <= 7) {
      return `⏰ **Deadline in ${daysUntilDeadline} days** (${deadline.toLocaleDateString()})`;
    } else {
      return `📅 Deadline: ${deadline.toLocaleDateString()} (${daysUntilDeadline} days remaining)`;
    }
  }
}

export const deadlineService = new DeadlineService();
