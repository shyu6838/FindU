INSERT INTO categories (name)
VALUES
    ('전자기기'),
    ('지갑'),
    ('카드'),
    ('열쇠'),
    ('가방'),
    ('의류'),
    ('서류'),
    ('기타')
    ON CONFLICT (name) DO NOTHING;