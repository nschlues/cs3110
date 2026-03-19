

// Teacher Provided parseBasicAuth function


app.get('/protected', (request, response) => {
    const credentials = parseBasicAuth(request.headers['authorization']);
    if (!credentials) return response.status(401).send('Unauthorized');
});

