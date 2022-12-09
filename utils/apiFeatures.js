class ApiFeatures {
    constructor(query, reqQuery) {
        this.query = query
        this.reqQuery = reqQuery
    }

    search() {
        const keyword = this.reqQuery.keyword ? {
            name: {
                $regex: this.reqQuery.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({...keyword})

        return this
    }


    filter() {
        const reqQuery = {...this.reqQuery}

        // Removing Fields for Category
        const removeFields = ['keyword', 'page', 'limit']
        removeFields.forEach((key) => delete reqQuery[key])

        // Filter for Price and Rating
        let queryStr = JSON.stringify(reqQuery)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)

        this.query = this.query.find(JSON.parse(reqQuery))

        return this
    }


    pagination(resultPerPage) {
        const currentPage = Number(this.reqQuery.page) || 1

        const skip = resultPerPage * (currentPage - 1)

        this.query = this.query.limit(resultPerPage).skip(skip)

        return this
    }
}

module.exports = ApiFeatures