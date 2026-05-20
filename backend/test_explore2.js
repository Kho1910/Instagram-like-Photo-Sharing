(async () => {
    try {
        const s = require('./src/services/exploreService')
        const r = await s.getExplore(1, null)
        console.log('RAW RESULT TYPE:', typeof r)
        console.log(r)
    } catch (e) {
        console.error('ERR', e && e.message)
        console.error(e)
    }
})()
