import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 });
    }

    // 构建对话上下文
    const systemPrompt = `你是一位专业、热情的宠物健康顾问。你的职责是：
1. 回答用户关于宠物健康的问题
2. 提供科学的养宠建议
3. 当情况严重时，建议用户尽快就医
4. 用通俗易懂的语言解释专业问题
5. 保持友好、耐心的态度

注意：
- 你的建议仅供参考，不能替代专业兽医诊断
- 如果情况紧急或严重，明确告知用户立即就医
- 可以询问更多症状细节以提供更准确的建议`;

    // 构建消息历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // 使用 Minimax API
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Minimax API error:', errorText);
      throw new Error('AI 服务暂时不可用');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答，请稍后重试。';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI consultation error:', error);
    return NextResponse.json({ error: error.message || '服务暂时不可用' }, { status: 500 });
  }
}
