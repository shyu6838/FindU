package findu.backend.category.service;

import findu.backend.category.dto.CategoryResponseDto;
import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getCategories() {

        List<Category> categories =
                categoryRepository.findAll();

        return categories.stream()
                .map(CategoryResponseDto::from)
                .toList();
    }
}