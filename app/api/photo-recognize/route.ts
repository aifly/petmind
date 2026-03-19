import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, petType } = body;

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 });
    }

    // Minimax 视觉模型 API
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Vision-01',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的宠物识别专家，擅长通过照片识别宠物的品种、特征和健康状态。请用中文详细描述。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              },
              {
                type: 'text',
                text: petType 
                  ? `请识别这只宠物。需要特别关注：品种判断、外观特征、健康状态初步评估（仅供参考）。这是${petType === 'dog' ? '狗狗' : petType === 'cat' ? '猫咪' : '宠物'}。`
                  : '请识别这只宠物。需要提供：品种判断、外观特征描述、健康状态初步评估（仅供参考）。'
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Minimax API error:', errorText);
      throw new Error('识别服务暂时不可用');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '识别完成，请稍后重试';

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Photo recognize error:', error);
    return NextResponse.json({ error: error.message || '识别失败，请重试' }, { status: 500 });
  }
}
