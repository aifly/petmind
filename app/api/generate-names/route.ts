import { NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

export async function POST(request: Request) {
  try {
    const { petType, gender, personality, style } = await request.json();

    const prompt = `请为一只${gender === 'male' ? '公' : '母'}${petType}生成5个${style}风格的名字。
性格特点：${personality || '活泼可爱'}

要求：
1. 名字要有创意，不要常见的"旺财"、"咪咪"等
2. 每个名字附带简短寓意说明
3. 格式：名字 - 寓意
4. 用中文回复`;

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
            content: '你是一个专业的宠物命名专家，擅长根据宠物品种、性格和主人喜好生成有创意的名字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';

    // 解析名字列表
    const names = generatedText
      .split('\n')
      .filter((line: string) => line.trim() && (line.includes('-') || line.includes('——') || line.includes('：')))
      .map((line: string) => {
        const parts = line.split(/[-——：]/);
        return {
          name: parts[0]?.trim().replace(/^\d+\.\s*/, '') || '',
          meaning: parts[1]?.trim() || '',
        };
      })
      .filter((item: {name: string; meaning: string}) => item.name && item.name.length <= 10);

    return NextResponse.json({ names, raw: generatedText });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}
