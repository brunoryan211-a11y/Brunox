import { Book, DueNotification } from '../types';
import { formatDateBR, getDaysDifference } from './dateUtils';

/**
 * Generates structured notifications for borrowed books:
 * - Overdue books
 * - Due today books
 * - Due soon books (within next 3 days)
 */
export function generateDueNotifications(books: Book[]): DueNotification[] {
  const notifications: DueNotification[] = [];

  books.forEach((book) => {
    if (!book.isBorrowed || !book.currentLoan) return;

    const loan = book.currentLoan;
    const diff = getDaysDifference(loan.dueDate); // < 0 is overdue, 0 is today, > 0 is days remaining

    if (diff < 0) {
      const overdueDays = Math.abs(diff);
      notifications.push({
        id: `notif-overdue-${book.id}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCode: book.code,
        isbn: book.isbn,
        readerName: loan.studentName,
        readerClass: loan.studentClass,
        dueDate: loan.dueDate,
        borrowedDate: loan.borrowedDate,
        type: 'overdue',
        daysDifference: diff,
        message: `Livro "${book.title}" com ${loan.studentName} (${loan.studentClass}) está ATRASADO há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}. Data limite era ${formatDateBR(loan.dueDate)}.`,
      });
    } else if (diff === 0) {
      notifications.push({
        id: `notif-today-${book.id}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCode: book.code,
        isbn: book.isbn,
        readerName: loan.studentName,
        readerClass: loan.studentClass,
        dueDate: loan.dueDate,
        borrowedDate: loan.borrowedDate,
        type: 'due_today',
        daysDifference: 0,
        message: `O prazo de devolução do livro "${book.title}" com ${loan.studentName} (${loan.studentClass}) VENCE HOJE (${formatDateBR(loan.dueDate)}).`,
      });
    } else if (diff <= 3) {
      notifications.push({
        id: `notif-soon-${book.id}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCode: book.code,
        isbn: book.isbn,
        readerName: loan.studentName,
        readerClass: loan.studentClass,
        dueDate: loan.dueDate,
        borrowedDate: loan.borrowedDate,
        type: 'due_soon',
        daysDifference: diff,
        message: `O livro "${book.title}" com ${loan.studentName} (${loan.studentClass}) vence em ${diff} ${diff === 1 ? 'dia' : 'dias'} (${formatDateBR(loan.dueDate)}).`,
      });
    }
  });

  // Sort by urgency: overdue first (most overdue first), then due today, then due soon
  return notifications.sort((a, b) => a.daysDifference - b.daysDifference);
}

/**
 * Dispatches a native browser notification if permission is granted
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
    return true;
  } catch (err) {
    console.error('Falha ao enviar notificação do navegador:', err);
    return false;
  }
}

/**
 * Builds formatted text message for student or coordinator
 */
export function buildReaderNotificationText(notification: DueNotification): string {
  const formattedDate = formatDateBR(notification.dueDate);

  if (notification.type === 'overdue') {
    const days = Math.abs(notification.daysDifference);
    return `Olá, ${notification.readerName} (${notification.readerClass})!\n\n` +
      `🚨 *Aviso de Atraso da Biblioteca Escolar*\n` +
      `O livro "*${notification.bookTitle}*" (Tombo: ${notification.bookCode}) está com devolução em atraso há ${days} ${days === 1 ? 'dia' : 'dias'}.\n` +
      `📅 *Data prevista de devolução:* ${formattedDate}\n\n` +
      `Por favor, entregue o livro na biblioteca ou solicite a renovação com o responsável. Obrigado! 📚`;
  }

  if (notification.type === 'due_today') {
    return `Olá, ${notification.readerName} (${notification.readerClass})!\n\n` +
      `⏰ *Lembrete da Biblioteca Escolar*\n` +
      `O livro "*${notification.bookTitle}*" (Tombo: ${notification.bookCode}) *VENCE HOJE* (${formattedDate}).\n\n` +
      `Caso já tenha concluído a leitura, por favor dirija-se à biblioteca para devolver ou renovar o empréstimo! 📖`;
  }

  return `Olá, ${notification.readerName} (${notification.readerClass})!\n\n` +
    `📖 *Lembrete Preventivo da Biblioteca Escolar*\n` +
    `O livro "*${notification.bookTitle}*" (Tombo: ${notification.bookCode}) está próximo do vencimento.\n` +
    `📅 *Data de devolução:* ${formattedDate} (faltam ${notification.daysDifference} ${notification.daysDifference === 1 ? 'dia' : 'dias'}).\n\n` +
    `Boa leitura e obrigado pelo cuidado com o acervo! ✨`;
}
