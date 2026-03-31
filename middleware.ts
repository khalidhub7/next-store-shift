middleware(request)
  // 1. read cookie "sessionId"

  // 2. if route is protected:
      // if no session → redirect /login

  // 3. if logged in and visiting /login:
      // redirect to /products

  // 4. otherwise → allow request