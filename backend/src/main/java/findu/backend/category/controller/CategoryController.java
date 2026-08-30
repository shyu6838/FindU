package findu.backend.category.controller;

import findu.backend.category.dto.CategoryResponseDto;
import findu.backend.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 카테고리 목록 조회를 처리하는 컨트롤러
@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    // 전체 카테고리 목록 조회
    @GetMapping
    public List<CategoryResponseDto> getCategories() {
        return categoryService.getCategories();
    }
}