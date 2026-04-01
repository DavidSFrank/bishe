const { getAdmin, postAdmin, patchAdmin, delAdmin } = require('../../utils/request')

function fetchArticles(params) {
    return getAdmin('/articles/', params)
}

function createArticle(payload) {
    return postAdmin('/articles/', payload)
}

function updateArticle(id, payload) {
    return patchAdmin(`/articles/${id}/`, payload)
}

function deleteArticle(id) {
    return delAdmin(`/articles/${id}/`)
}

module.exports = {
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle
}

