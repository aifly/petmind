import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { petType, gender, style, personality, type, prompt } = body;

    // 如果是喂养建议类型
    if (type === 'feeding' && prompt) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一位专业的宠物营养师，精通各种宠物的喂养知识。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const advice = data.choices?.[0]?.message?.content || '生成失败，请重试';
      return NextResponse.json({ advice });
    }

    // 原有的名字生成逻辑
    if (!petType) {
      return NextResponse.json({ error: '请选择宠物类型' }, { status: 400 });
    }

    const petTypeNames: Record<string, string> = {
      cat: '猫咪',
      dog: '狗狗',
      bird: '鸟类',
      fish: '鱼类',
      rabbit: '兔子',
    };

    const genderNames: Record<string, string> = {
      male: '小王子',
      female: '小公主',
    };

    const styleNames: Record<string, string> = {
      cute: '可爱',
      cool: '酷炫',
      elegant: '优雅',
      funny: '搞笑',
      food: '食物',
    };

    const promptText = `请为一只${petTypeNames[petType] || '宠物'}取5个独特的名字。
性别：${genderNames[gender] || '不限'}
风格：${styleNames[style] || '任意'}风
${personality ? `性格特点：${personality}` : ''}

请用JSON数组格式返回，格式如下：
[{"name":"名字1","meaning":"寓意说明"},{"name":"名字2","meaning":"寓意说明"}]

只返回JSON数组，不要其他内容。`;

    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: '你是一位创意取名专家，擅长为宠物取独特有意义的名字。' },
          { role: 'user', content: promptText },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    let names = [];
    try {
      names = JSON.parse(content);
    } catch {
      names = [];
    }

    return NextResponse.json({ names });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
