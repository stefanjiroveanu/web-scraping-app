const errorHandler = (error, req, resp, next) => {
    return resp.status(400).send(error.message)
};

module.exports = errorHandler;