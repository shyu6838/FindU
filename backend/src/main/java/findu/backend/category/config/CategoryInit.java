package findu.backend.category.config;

import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// 애플리케이션 실행 시 초기 카테고리 데이터를 생성하는 설정 클래스
@Component
@RequiredArgsConstructor
public class CategoryInit implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<String> names = List.of(
                "카드/신분증",
                "이어폰/헤드폰",
                "스마트폰/노트북/태블릿",
                "지갑",
                "책/노트/필기구",
                "가방/파우치",
                "의류/모자",
                "기타 전자기기",
                "기타"
            );
            for (String name : names) {
                categoryRepository.save(Category.builder().name(name).build());
            }
        }
    }
}