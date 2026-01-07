import { Container } from '@/components/layout/Container';
import { ProductForm } from '@/components/forms/ProductForm';

export default function NewProductPage() {
  return (
    <Container size="lg" className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 제품 만들기</h1>
        <p className="mt-2 text-gray-600">
          제품 아이디어를 설명하는 것부터 시작하세요. 나중에 사용자 리서치를 추가하고 PRD를 생성할 수 있습니다.
        </p>
      </div>

      <ProductForm />
    </Container>
  );
}
