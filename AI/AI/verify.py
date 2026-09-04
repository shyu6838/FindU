import torch
import open_clip
from PIL import Image
from deep_translator import GoogleTranslator

print("1. OpenCLIP 모델 및 번역기 초기화 중...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model = model.to(device)
model.eval()
tokenizer = open_clip.get_tokenizer('ViT-B-32')

print("2. 텍스트 임베딩 추출 테스트 (한국어 번역 포함)...")
ko_text = "검은색 가방"
en_text = GoogleTranslator(source='ko', target='en').translate(ko_text)
print(f"원문: '{ko_text}' -> 번역: '{en_text}'")

text_tokens = tokenizer([en_text]).to(device)
with torch.no_grad():
    text_features = model.encode_text(text_tokens)
    text_features /= text_features.norm(dim=-1, keepdim=True)
    text_vec = text_features.cpu().numpy().flatten().tolist()

print(f"✅ 텍스트 벡터 추출 성공! 차원 수: {len(text_vec)}, 앞쪽 샘플 값: {text_vec[:3]}\n")

print("3. pgvector 연동 준비 완료! (AI 서버는 백엔드로 임베딩 배열을 반환하도록 설정되었습니다.)")