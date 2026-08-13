import os
import pickle
import torch
import open_clip
import faiss
import numpy as np
from PIL import Image

INDEX_FILE = "faiss_index.bin"
MAP_FILE = "id_map.pkl"

print("1. OpenCLIP 모델을 로드하는 중...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model = model.to(device)
tokenizer = open_clip.get_tokenizer('ViT-B-32')

# Faiss 인덱스 및 매핑 초기화
index = faiss.IndexFlatIP(512)
id_map = []

print("2. 'test_images' 폴더 내 이미지 벡터화 및 Faiss 등록 시작...")
image_folder = "./test_images"
image_files = ["black_bag.jpg", "red_wallet.jpg", "blue_umbrella.jpg"]

for img_name in image_files:
    img_path = os.path.join(image_folder, img_name)
    if not os.path.exists(img_path):
        print(f"오류: {img_path} 파일이 없습니다. test_images 폴더에 이미지를 넣어주세요.")
        continue

    image = Image.open(img_path).convert("RGB")
    processed_image = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(processed_image)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        vector = image_features.cpu().numpy().astype('float32')

    index.add(vector)
    id_map.append(img_name)
    print(f" 성공적으로 등록됨: {img_name}")

# 등록 완료 후 파일로 저장
faiss.write_index(index, INDEX_FILE)
with open(MAP_FILE, "wb") as f:
    pickle.dump(id_map, f)
print(f"\n💾 테스트 데이터가 {INDEX_FILE} 및 {MAP_FILE} 파일로 저장되었습니다.")
print(f"현재 Faiss에 등록된 총 벡터 수: {index.ntotal}개\n")

print("3. 자연어 문장으로 시맨틱 검색 테스트 수행...")
query_text = "a dark backpack"
print(f"검색어: '{query_text}'")

text_tokens = tokenizer([query_text]).to(device)

with torch.no_grad():
    text_features = model.encode_text(text_tokens)
    text_features /= text_features.norm(dim=-1, keepdim=True)
    query_vector = text_features.cpu().numpy().astype('float32')

D, I = index.search(query_vector, 2)

print("\n--- [검색 결과] ---")
for rank, (score, idx) in enumerate(zip(D[0], I[0])):
    print(f"{rank + 1}등: {id_map[idx]} (유사도 점수: {score:.4f})")