import { analyzeIntent, extractEntities } from './agents/intentAnalyzer';
import { contextManager } from './agents/contextManager';
import { generateWorkflow } from './agents/workflowGenerator';
import { getFAQAnswer } from './knowledge/appKnowledge';

export type AIResponse = {
  type: 'text' | 'preview' | 'clarification' | 'action' | 'error';
  message: string;
  data?: any;
  suggestions?: string[];
  requiresConfirmation?: boolean;
};

export const aiCopilot = {
  async processMessage(text: string): Promise<AIResponse> {
    // 1. تحليل النية
    const intent = analyzeIntent(text);
    const entities = extractEntities(text);
    
    // 2. حفظ السياق
    contextManager.addTurn('user', text, intent);
    
    // 3. المساعدة
    if (intent.action === 'help') {
      const faqAnswer = getFAQAnswer(text);
      if (faqAnswer) {
        return {
          type: 'text',
          message: faqAnswer,
          suggestions: contextManager.getSuggestions(),
        };
      }
      return {
        type: 'text',
        message: 'يمكنني مساعدتك في: إنشاء الفواتير، السندات، القيود، الاستعلام عن الأرصدة، عرض التقارير، وإرسال المستندات.',
        suggestions: contextManager.getSuggestions(),
      };
    }

    // 4. غير مفهوم - طرح أسئلة
    if (intent.action === 'unknown' || intent.confidence < 0.5) {
      const questions = contextManager.getClarificationQuestions(intent);
      return {
        type: 'clarification',
        message: questions[0] || 'هل يمكنك توضيح طلبك؟',
        suggestions: questions,
      };
    }

    // 5. إنشاء خطة العمل
    const context = contextManager.getContext();
    const plan = await generateWorkflow(intent, entities, context);

    // 6. عرض المعاينة
    if (plan.requiresConfirmation) {
      return {
        type: 'preview',
        message: `📋 ${plan.preview.type}\n\n${JSON.stringify(plan.preview, null, 2)}\n\nهل تريد المتابعة؟`,
        data: { intent, entities, plan },
        requiresConfirmation: true,
        suggestions: ['✅ نعم، نفذ العملية', '❌ إلغاء'],
      };
    }

    // 7. استعلام مباشر
    return {
      type: 'action',
      message: `جاري ${intent.entity === 'balance' ? 'عرض' : 'تنفيذ'} ${intent.entity}...`,
      data: { intent, entities, plan },
      suggestions: contextManager.getSuggestions(),
    };
  },

  async confirmExecution(data: any): Promise<AIResponse> {
    // تنفيذ العملية بعد موافقة المستخدم
    const { intent, entities } = data;
    const operation = intent.entity;
    
    // تنفيذ عبر Workflow Engine
    const result = await import('../engine/workflowEngine').then(m => 
      m.workflowEngine.execute(operation, { ...entities, date: new Date().toISOString().split('T')[0] })
    );

    if (result.success) {
      return {
        type: 'text',
        message: `✅ تمت العملية بنجاح!\n${result.message || ''}`,
        suggestions: contextManager.getSuggestions(),
      };
    } else {
      return {
        type: 'error',
        message: `❌ فشلت العملية: ${result.error}`,
        suggestions: ['حاول مرة أخرى', 'تعديل البيانات'],
      };
    }
  },

  getSuggestions(): string[] {
    return contextManager.getSuggestions();
  },
};

export default aiCopilot;
