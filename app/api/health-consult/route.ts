import { NextRequest, NextResponse } from 'next/server';

const petTypeMap: Record<string, string> = {
  cat: '猫',
  dog: '狗',
  bird: '鸟',
  rabbit: '兔子',
  other: '宠物',
};

const issueMap: Record<string, string> = {
  digestion: '消化问题',
  skin: '皮肤问题',
  behavior: '行为异常',
  eyes: '眼睛问题',
  ears: '耳朵问题',
  teeth: '牙齿口腔问题',
  joints: '关节问题',
  breathing: '呼吸问题',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { petType, issue, symptoms, duration } = body;

    if (!issue || !symptoms) {
      return NextResponse.json({ error: '请提供问题类型和症状描述' }, { status: 400 });
    }

    const petTypeName = petTypeMap[petType] || '宠物';
    const issueName = issueMap[issue] || issue;

    const prompt = `你是一位专业的宠物兽医。请根据以下信息提供初步的健康建议：

宠物类型：${petTypeName}
问题类型：${issueName}
症状描述：${symptoms}
持续时间：${duration || '未说明'}

请提供：
1. 可能的原因分析
2. 家庭护理建议
3. 需要注意观察的症状
4. 何时应该就医的判断标准

注意：仅供参考，不能替代专业兽医诊断。请用温和、专业的语气回复。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业、有爱心的宠物兽医。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || '抱歉，暂时无法获取建议，请稍后重试。';

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Health consultation error:', error);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
