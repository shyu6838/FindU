import io
import torch
import open_clip
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator

# ---------------------------------------------------------
# FastAPI App 생성 및 CORS 설정
# ---------------------------------------------------------
app = FastAPI(
    title="Capstone Lost & Found AI Embedding Server",
    description="OpenCLIP 기반 이미지 및 텍스트 벡터 임베딩 추출 전용 서버 (pgvector 연동용)",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# OpenCLIP 모델 로드
# ---------------------------------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"사용 중인 장치: {device}")

# OpenCLIP 모델 및 토크나이저 초기화
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model = model.to(device)
model.eval()  # 추론 전용 모드
tokenizer = open_clip.get_tokenizer('ViT-B-32')


# ---------------------------------------------------------
# Pydantic 데이터 모델
# ---------------------------------------------------------
class TextEmbeddingRequest(BaseModel):
    text: str


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.get("/health")
def health_check():
    """AI 서버 상태 확인 헬스체크"""
    return {
        "status": "healthy",
        "device": device,
        "model": "ViT-B-32 (laion2b_s34b_b79k)",
        "vector_dimension": 512
    }


@app.post("/api/ai/embedding/image")
async def extract_image_embedding(file: UploadFile = File(...)):
    """
    [이미지 임베딩 추출 API]
    백엔드에서 전달받은 이미지 파일로부터 512차원 Float 백터 배열을 추출하여 반환합니다.
    백엔드는 이 배열을 PostgreSQL pgvector 컬럼에 저장하거나 검색에 사용합니다.
    """
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # 이미지 전처리 및 벡터 추출
        processed_image = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(processed_image)
            # L2 Normalize (코사인 유사도 계산용 정규화)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            vector_list = image_features.cpu().numpy().flatten().tolist()

        return {
            "status": "success",
            "dimension": len(vector_list),
            "embedding": vector_list  # 512개 실수값의 배열
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 임베딩 추출 실패: {str(e)}")


@app.post("/api/ai/embedding/text")
def extract_text_embedding(request: TextEmbeddingRequest):
    """
    [텍스트/자연어 임베딩 추출 API]
    한국어 검색어를 영어로 번역 후 512차원 Float 벡터 배열을 추출하여 반환합니다.
    """
    query_text = request.text.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="검색어가 비어있습니다.")

    try:
        # 한국어 ➡️ 영어 자동 번역
        translated_text = GoogleTranslator(source='ko', target='en').translate(query_text)
        print(f"텍스트 번역: '{query_text}' -> '{translated_text}'")

        # 텍스트 토큰화 및 벡터 추출
        text_tokens = tokenizer([translated_text]).to(device)
        with torch.no_grad():
            text_features = model.encode_text(text_tokens)
            # L2 Normalize
            text_features /= text_features.norm(dim=-1, keepdim=True)
            vector_list = text_features.cpu().numpy().flatten().tolist()

        return {
            "original_text": query_text,
            "translated_text": translated_text,
            "dimension": len(vector_list),
            "embedding": vector_list  # 512개 실수값의 배열
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"텍스트 임베딩 추출 실패: {str(e)}")