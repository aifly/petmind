import { NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

export async function POST(request: Request) {
  try {
    const { petType, behaviors, age } = await request.json();

    const prompt = `请根据以下信息分析这只${petType}的性格特点：

年龄：${age || '未知'}
行为表现：${behaviors}

请给出：
1. 性格类型（如：活泼型、温顺型、独立型等）
2. 性格特点分析（3-5点）
3. 饲养建议（2-3条）
4. 适合的互动方式

用中文回复，格式清晰。`;

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的宠物行为分析师，擅长根据宠物的行为表现分析其性格特点，并给出科学的饲养建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '分析失败，请重试' },
      { status: 500 }
    );
  }
}
