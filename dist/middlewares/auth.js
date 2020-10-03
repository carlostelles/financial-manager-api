"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_json_1 = __importDefault(require("../config/auth.json"));
exports.default = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ msg: 'Unauthorized' });
    }
    const parts = authHeader.split(' ');
    if (!(parts.length === 2)) {
        return res.status(401).send({ msg: 'Token error' });
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ msg: 'Token error' });
    }
    jsonwebtoken_1.default.verify(token, auth_json_1.default.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ msg: 'Token invalid' });
        }
        req.user = decoded.param;
        return next();
    });
};
//# sourceMappingURL=auth.js.map