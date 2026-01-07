import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  getResearchByProductId,
  createPRDVersion,
  getNextPRDVersion,
  createValidationMarkers,
} from '@/lib/db/queries';
import { getAnthropicClient, getModelName } from '@/lib/anthropic/client';
import { generateInitialPRDPrompt } from '@/lib/anthropic/prompts';
import type { PRDGenerationOutput } from '@/lib/anthropic/types';
import type { GeneratePRDRequest, GeneratePRDResponse, ErrorResponse } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePRDRequest = await request.json();
    const { product_id } = body;

    if (!product_id) {
      const errorResponse: ErrorResponse = {
        error: 'product_id가 필요합니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get product
    const product = await getProductById(product_id);
    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get all research for this product
    const research = await getResearchByProductId(product_id);

    // Generate prompt
    const prompt = generateInitialPRDPrompt(product, research);

    // Call Claude API
    const anthropic = getAnthropicClient();
    const model = getModelName();

    const message = await anthropic.messages.create(
      {
        model,
        max_tokens: 8000, // 상세한 MVP PRD (약 3000자 기준)
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        timeout: 5 * 60 * 1000, // 5분 타임아웃
      }
    );

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON from the response
    let prdOutput: PRDGenerationOutput;
    try {
      console.log('=== Claude 응답 디버깅 ===');
      console.log('원본 응답 길이:', responseText.length);
      console.log('원본 응답 처음 500자:', responseText.substring(0, 500));

      // 여러 방법으로 JSON 추출 시도
      let jsonText = responseText.trim();

      // 코드 블록 제거 (```json 또는 ``` 로 시작하는 경우)
      if (jsonText.startsWith('```')) {
        // 첫 번째 줄 제거 (```json 또는 ``` 부분)
        const lines = jsonText.split('\n');
        lines.shift(); // 첫 줄 제거

        // 마지막 ``` 제거
        if (lines[lines.length - 1].trim() === '```') {
          lines.pop();
        }

        jsonText = lines.join('\n').trim();
        console.log('✓ 코드 블록 제거 완료');
      }

      // 혹시 남아있는 백틱 제거
      jsonText = jsonText.replace(/^`+|`+$/g, '').trim();

      // "json" 단어가 맨 앞에 남아있으면 제거
      if (jsonText.startsWith('json')) {
        jsonText = jsonText.substring(4).trim();
        console.log('✓ "json" 텍스트 제거 완료');
      }

      console.log('파싱할 JSON 텍스트 처음 500자:', jsonText.substring(0, 500));

      // JSON 파싱
      prdOutput = JSON.parse(jsonText);

      // 필수 필드 검증
      if (!prdOutput.prd_content || !Array.isArray(prdOutput.validation_markers)) {
        throw new Error('PRD 응답 형식이 올바르지 않습니다. prd_content와 validation_markers 필드가 필요합니다.');
      }

      console.log('✓ PRD 파싱 성공');
      console.log('✓ PRD 내용 길이:', prdOutput.prd_content.length);
      console.log('✓ 검증 마커 개수:', prdOutput.validation_markers.length);
    } catch (parseError) {
      console.error('❌ Claude 응답 파싱 실패');
      console.error('에러:', parseError);
      console.error('전체 응답 (처음 1000자):', responseText.substring(0, 1000));
      throw new Error(`Claude API 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
    }

    // Get next version number
    const versionNumber = await getNextPRDVersion(product_id);

    // Save PRD version
    const prdVersionId = await createPRDVersion({
      product_id,
      version_number: versionNumber,
      content: prdOutput.prd_content,
      validation_annotations: prdOutput.validation_markers,
      research_snapshot: research.map((r) => r.id),
      generation_prompt: prompt,
    });

    // Save validation markers
    if (prdOutput.validation_markers && prdOutput.validation_markers.length > 0) {
      const markersToCreate = prdOutput.validation_markers.map((marker) => ({
        prd_version_id: prdVersionId,
        feature_name: marker.feature_name,
        marker_type: marker.marker_type,
        description: marker.description,
        section_context: marker.section_context,
      }));

      await createValidationMarkers(markersToCreate);
    }

    const response: GeneratePRDResponse = {
      prd_version_id: prdVersionId,
      version_number: versionNumber,
      content: prdOutput.prd_content,
      validation_markers: prdOutput.validation_markers,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error generating PRD:', error);

    const errorResponse: ErrorResponse = {
      error: 'PRD 생성에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
