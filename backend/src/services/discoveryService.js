// Code chấm điểm và đề xuất post

/**
 * Chấm điểm bài viết dựa trên tương tác và ĐỘ mới
 */
const calculatePostScore = ( post ) => {
    let score = 0;

    // Cộng điểm tương tác
    score += post._count.likes * 1;
    score += post._count.comments * 2;

    // Cộng điểm độ mới
    // Bài đăng trong vòng 24h được ưu tiên cao hơn
    const hoursSinceCreated = Math.abs(new Date() - new Date(post.created_at)) / 36e5;
    score += Math.max(0, 100 - hoursSinceCreated);

    // Trừ điểm nếu đã xem post để đẩy post khác lên
    if (post._count.views > 0) {
        score -= 636; // Trừ cực mạnh
    }

    return score;
}

module.exports = { calculatePostScore }