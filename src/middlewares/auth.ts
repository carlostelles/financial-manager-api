import jwt, {JsonWebTokenError, NotBeforeError, TokenExpiredError} from "jsonwebtoken";
import {HookNextFunction} from "mongoose";

import authConfig from "../config/auth.json";

export default (req: any, res: any, next: HookNextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({msg: 'Unauthorized'})
    }

    const parts = authHeader.split(' ');

    if (!(parts.length === 2)) {
        return res.status(401).send({msg: 'Token error'});
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({msg: 'Token error'});
    }

    jwt.verify(token, authConfig.secret, (err: JsonWebTokenError | TokenExpiredError | NotBeforeError | null, decoded: any) => {
        if (err) {
            return res.status(401).send({msg: 'Token invalid'});
        }

        req.user = decoded.param;

        return next();
    });
};
