/** Dự đoán resolution tier dựa trên chiều rộng ảnh */
export function predictTier(width) {
  if (width > 1080) return 'large'
  if (width > 720)  return 'medium'
  if (width > 480)  return 'small'
  return 'original'
}

/** Đọc thông tin ảnh từ File object */
export function readImageInfo(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({
        url,
        width:   img.width,
        height:  img.height,
        size:    file.size,
        name:    file.name,
        tier:    predictTier(img.width),
      })
    }
    img.src = url
  })
}
