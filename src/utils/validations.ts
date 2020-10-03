export function getErrorJson(err: any, res: any, msg?: any) {
    if (err.name == 'ValidationError') {
        console.error('Error Validating!', err);
        const errors = Object.keys(err.errors).map(error => {
            return err.errors[error].message;
        });
        return res.status(422).send({msg: 'Validation failed', errors: errors});
    } else {
        console.error(err);
        return res.status(400).send(!msg ? err : msg);
    }
}
