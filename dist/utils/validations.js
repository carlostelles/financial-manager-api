"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorJson = void 0;
function getErrorJson(err, res, msg) {
    if (err.name == 'ValidationError') {
        console.error('Error Validating!', err);
        const errors = Object.keys(err.errors).map(error => {
            return err.errors[error].message;
        });
        return res.status(422).send({ msg: 'Validation failed', errors: errors });
    }
    else {
        console.error(err);
        return res.status(400).send(!msg ? err : msg);
    }
}
exports.getErrorJson = getErrorJson;
//# sourceMappingURL=validations.js.map