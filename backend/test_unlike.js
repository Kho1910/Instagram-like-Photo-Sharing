(async () => {
    try {
        const s = require('./src/services/postService')
        const r = await s.unlikePost(1, 101)
        console.log('unlike result:', r)
    } catch (e) { console.error('ERR', e && e.message, e) }
})()
