import * as argon2 from 'argon2';

const defaultHashOptions = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 15,
    parallelism: 100,
    type: argon2.argon2id
};

function verifyPassword(hashedPassword: string, password: string) {
    return argon2.verify(hashedPassword, password);
}

function hashPassword(password: string, options = defaultHashOptions) {
    return argon2.hash(password, options);
}

export {
    verifyPassword,
    hashPassword
};
