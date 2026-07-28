interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  intent?: any;
  timestamp: number;
}

class ContextManager {
  private history: ConversationTurn[] = [];
  private currentContext: Record<string, any> = {};
  private maxHistory = 20;

  addTurn(role: 'user' | 'assistant', text: string, intent?: any) {
    this.history.push({ role, text, intent, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getContext(): Record<string, any> {
    return { ...this.currentContext, recentHistory: this.history.slice(-5) };
  }

  setContext(key: string, value: any) {
    this.currentContext[key] = value;
  }

  clearContext() {
    this.currentContext = {};
  }

  getLastIntent(): any {
    const last = [...this.history].reverse().find(t => t.role === 'user' && t.intent);
    return last?.intent || null;
  }

  // اقتراح أسئلة توضيحية
  getClarificationQuestions(intent: any): string[] {
    if (!intent || intent.confidence < 0.7) {
      return [
        'هل يمكنك توضيح ما تريد فعله بالضبط؟',
        'هل تريد إنشاء أم استعلام أم تعديل؟',
      ];
    }
    if (intent.entity === 'sales_invoice') {
      return [
        'هل الفاتورة نقدية أم آجلة؟',
        'من هو العميل؟',
        'ما هي الأصناف والكميات؟',
      ];
    }
    return [];
  }

  getSuggestions(): string[] {
    return [
      '🎙️ "أضف فاتورة بيع نقدية"',
      '🎙️ "كم رصيد الصندوق؟"',
      '🎙️ "أنشئ سند قبض"',
      '🎙️ "عرض ميزان المراجعة"',
      '🎙️ "أرسل كشف حساب العميل أحمد"',
    ];
  }
}

export const contextManager = new ContextManager();
