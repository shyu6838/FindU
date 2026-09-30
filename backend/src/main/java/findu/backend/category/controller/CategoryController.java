package findu.backend.category.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "카테고리", description = "분실물과 습득물 등록에 사용하는 카테고리 API")
public class CategoryController {

    private final CategoryService categoryService;

    // 전체 카테고리 목록 조회
    @GetMapping
    @Operation(summary = "카테고리 목록 조회")
    @SecurityRequirements
    public List<CategoryResponseDto> getCategories() {
        return categoryService.getCategories();
    }
}
