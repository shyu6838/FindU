import io
import os
import pickle
import faiss
import torch
import open_clip
import numpy as np
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator

# 영구 저장할 파일 경로 정의
INDEX_FILE = "faiss_index.bin"
MAP_FILE = "id_map.pkl"

# 전역 변수 선언
index = None
id_map = []

# 데이터 파일 자동 저장 헬퍼 함수
def save_data():
    global index, id_map
    faiss.write_index(index, INDEX_FILE)
    with open(MAP_FILE, "wb") as f:
        pickle.dump(id_map, f)
    print("💾 Faiss 인덱스 및 ID 매핑 파일이 성공적으로 저장되었습니다.")

# 서버 시작/종료 수명주기(Lifespan) 관리
@asynccontextmanager
async def lifespan(app: FastAPI):
    global index, id_map
    dimension = 512

    # 1. 기존 저장 파일 존재 여부 확인 후 로드
    if os.path.exists(INDEX_FILE) and os.path.exists(MAP_FILE):
        index = faiss.read_index(INDEX_FILE)
        with open(MAP_FILE, "rb") as f:
            id_map = pickle.load(f)
        print(f" 기존 Faiss 데이터 로드 완료! (등록된 분실물 수: {len(id_map)}개)")
    else:
        index = faiss.IndexFlatIP(dimension)
        id_map = []
        print("🆕 새로운 Faiss 인덱스를 생성했습니다.")

    yield # 서버 동작 중...

app = FastAPI(title="Capstone Lost & Found AI Server", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. OpenCLIP 모델 로드
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"사용 중인 장치: {device}")
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model = model.to(device)
tokenizer = open_clip.get_tokenizer('ViT-B-32')


@app.get("/health")
def health_check():
    return {"status": "healthy", "registered_items_count": index.ntotal if index else 0}


# [API 1] 분실물 이미지 등록 (자동 파일 저장 로직 포함)
@app.post("/api/ai/register")
async def register_item(item_id: int = Form(...), file: UploadFile = File(...)):
    global index, id_map
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        processed_image = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(processed_image)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            vector = image_features.cpu().numpy().astype('float32')

        index.add(vector)
        id_map.append(item_id)

        # 등록 성공 시 디스크 파일로 즉시 영구 저장
        save_data()

        return {"status": "success", "message": f"Item {item_id} registered and saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"등록 실패: {str(e)}")


# [API 2] 자연어 검색 (번역 로직 포함)
@app.get("/api/ai/search")
def search_by_text(query: str, top_k: int = 5):
    global index, id_map
    if index is None or index.ntotal == 0:
        return {"results": []}

    try:
        translated_query = GoogleTranslator(source='ko', target='en').translate(query)
        print(f"인식된 검색어: {query} -> 모델 입력 검색어: {translated_query}")

        text_tokens = tokenizer([translated_query]).to(device)
        with torch.no_grad():
            text_features = model.encode_text(text_tokens)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            query_vector = text_features.cpu().numpy().astype('float32')

        search_k = min(top_k, index.ntotal)
        D, I = index.search(query_vector, search_k)

        results = []
        for score, idx in zip(D[0], I[0]):
            if idx == -1: continue
            results.append({
                "item_id": id_map[idx],
                "score": float(score)
            })

        return {"query": query, "translated_query": translated_query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")


# [API 3] 이미지 기반 유사 분실물 검색 (Image-to-Image Search)
@app.post("/api/ai/search/image")
async def search_by_image(file: UploadFile = File(...), top_k: int = 5):
    global index, id_map

    if index is None or index.ntotal == 0:
        return {"results": []}

    try:
        content = await file.read()
        query_image = Image.open(io.BytesIO(content)).convert("RGB")

        processed_image = preprocess(query_image).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(processed_image)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            query_vector = image_features.cpu().numpy().astype('float32')

        search_k = min(top_k, index.ntotal)
        D, I = index.search(query_vector, search_k)

        results = []
        for score, idx in zip(D[0], I[0]):
            if idx == -1: continue
            results.append({
                "item_id": id_map[idx],
                "score": float(score)
            })

        return {
            "message": "이미지 기반 유사도 검색 성공",
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 검색 실패: {str(e)}")