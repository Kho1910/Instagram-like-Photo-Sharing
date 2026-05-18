export const rules = {
  required: v => !!v?.trim() || 'Trường này bắt buộc',
  email:    v => /\S+@\S+\.\S+/.test(v) || 'Email không hợp lệ',
  minLen:   n => v => v?.length >= n || `Tối thiểu ${n} ký tự`,
  maxLen:   n => v => v?.length <= n || `Tối đa ${n} ký tự`,
}
