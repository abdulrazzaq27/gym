const sanitize = (obj) => {
    console.log('Validating object:', obj);
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            console.log('Key:', key);
            if (key.startsWith('$')) {
                console.log(`Removing key: ${key}`);
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    }
};

const body = {
    email: { "$gt": "" },
    password: "password"
};

sanitize(body);
console.log('Result:', JSON.stringify(body, null, 2));
