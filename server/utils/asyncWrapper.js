
// Creating ascynWrapper to wrap the controllers in order to get rid of try catch blocks in every controller
const asyncWrapper = (asyncController) => {
    return (req, res, next) => {
        asyncController(req, res, next).catch(next);
    }
}


module.exports = asyncWrapper;