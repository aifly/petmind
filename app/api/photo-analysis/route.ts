import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const petType = formData.get('petType') as string || '未知';
    const analysisType = formData.get('analysisType') as string || 'breed';

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 });
    }

    // 将图片转为 base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // 构建不同的分析 prompt
    const prompts: Record<string, string> = {
      breed: `请分析这张宠物照片，告诉我：
1. 这是什么品种的宠物？如果是混血，请分析可能的品种组合
2. 这个品种的典型特征和性格
3. 毛色和外观特点
4. 预估年龄（如果可以判断）

请用简洁清晰的格式回答。`,

      health: `作为专业兽医，请仔细观察这张宠物照片，分析：
1. 整体外观是否健康
2. 眼睛、耳朵、鼻子有无异常
3. 毛发和皮肤状况
4. 体型是否正常（过瘦/正常/过胖）
5. 是否有可见的健康问题需要关注

请用专业但易懂的语言回答，如果有异常请重点提醒。`,

      emotion: `请分析这张宠物照片中宠物的情绪状态：
1. 当前情绪（开心、紧张、放松等）
2. 肢体语言解读
3. 如何更好地与它互动
4. 它可能需要什么

请用温暖亲切的语气回答。`,
    };

    const prompt = prompts[analysisType] || prompts.breed;

    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '分析失败，请重试';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Photo analysis error:', error);
    return NextResponse.json({ error: error.message || '分析失败，请重试' }, { status: 500 });
  }
}
