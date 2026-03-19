import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 });
    }

    // 提取 base64 数据
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

    // 调用 MiniMax 多模态 API
    const response = await fetch('https://api.minimax.chat/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的宠物专家，擅长通过照片识别宠物品种、分析健康状态。请用专业但亲切的语气回复。',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请仔细分析这张宠物照片，提供以下信息：\n\n1. 宠物类型（猫/狗/其他）\n2. 可能的品种\n3. 毛色特征\n4. 健康状态观察（眼睛、毛发、体型等）\n5. 养护建议\n\n请用简洁清晰的格式回答。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('MiniMax API error:', errorData);
      
      // 如果 MiniMax 不支持图片，fallback 到纯文字提示
      if (response.status === 400 || response.status === 422) {
        return NextResponse.json({ 
          analysis: '抱歉，图片识别功能暂时不可用。\n\n请尝试：\n1. 检查图片格式是否正确\n2. 稍后重试\n\n或者直接描述你的宠物特征，我可以帮你分析。' 
        });
      }
      
      throw new Error('API 调用失败');
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '分析失败，请重试';

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Photo analysis error:', error);
    return NextResponse.json({ 
      error: error.message || '服务暂时不可用',
      analysis: '图片分析服务暂时不可用，请稍后重试。'
    });
  }
}
